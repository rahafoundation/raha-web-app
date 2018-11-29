import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { Map } from "immutable";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  Operation,
  OperationType
} from "@raha/api-shared/dist/models/Operation";
import { AppState } from "../store";
import { Loading } from "../components/Loading";
import { Member } from "../reducers/membersNew";

interface OwnProps {}

interface StateProps {
  operations: Operation[];
  members: Map<MemberId, Member>;
}

type Props = OwnProps & StateProps;

interface MetricTemplate {
  name: string;
  desc: string;
  fn: (args: MetricArgs) => [number, any];
}

interface MetricArgs {
  operations: Operation[];
  members: Map<MemberId, Member>;
  durationDays: number;
  end: Date;
}

const METRIC_DAYS = [30, 7];

const METRIC_TEMPLATES: MetricTemplate[] = [
  {
    name: 'Active Creators',
    desc: 'How many verified members have created at lease one "active" operation?',
    fn: (args: MetricArgs) => [getActiveCreators(args.operations, args.members, args.durationDays, args.end, false, true).size, null]
  },
  {
    name: 'Operation Creators',
    desc: 'How many members have created at lease one operation (including create member, request invite, request verification) operations?',
    fn: (args: MetricArgs) => [getActiveCreators(args.operations, args.members, args.durationDays, args.end, false, false).size, null]
  },
  {
    name: 'Member Retention',
    desc: 'Of all members active during the last period (week/month), how many are active this most recent period?',
    fn: (args: MetricArgs) => getRetention(args.operations, args.members, args.durationDays, args.end, false)
  },
  {
    name: 'New Member Retention',
    desc: 'Member retention for brand new members',
    fn: (args: MetricArgs) => getRetention(args.operations, args.members, args.durationDays, args.end, true)
  },
  {
    name: 'In-Person Invite Success',
    desc: 'Success rate for all in-person invites',
    fn: (args: MetricArgs) => getInviteSuccess(args.operations, args.durationDays, args.end, true)
  },
  {
    name: 'Remote Invite Success',
    desc: 'Success rate for all remote invites',
    fn: (args: MetricArgs) => getInviteSuccess(args.operations, args.durationDays, args.end, false)
  }
];

const NOT_ACTIVE_OPS = new Set([
  OperationType.CREATE_MEMBER,
  OperationType.REQUEST_INVITE,
  OperationType.REQUEST_VERIFICATION
]);

function getDaysAgo(numDays: number, date?: Date) {
  const daysAgo = date ? new Date(date.getTime()) : new Date();
  daysAgo.setDate(daysAgo.getDate() - numDays);
  return daysAgo;
}

// Should use binary search for efficiency
function getOperationsBetween(
  operations: Operation[],
  start: Date,
  end: Date,
) {
  return operations.filter(o => new Date(o.created_at) >= start && new Date(o.created_at) < end);
}

function getInviteSuccess(
  operations: Operation[],
  durationDays: number,
  end: Date,
  isJoint: boolean,
): [number, string] {
  const inviteIsFulfilled: { [index: string]: boolean } = {};
  const start = getDaysAgo(durationDays, end);
  for (const op of getOperationsBetween(operations, start, new Date())) {
    if (
      op.op_code === OperationType.INVITE &&
      op.data.is_joint_video === isJoint
    ) {
      const invite_token = op.data.invite_token;
      inviteIsFulfilled[invite_token] = false;
    } else if (op.op_code === OperationType.REQUEST_VERIFICATION) {
      const invite_token = op.data.invite_token;
      if (!invite_token) {
        continue;
      }
      inviteIsFulfilled[invite_token] = true;
    }
  }
  let success = 0;
  let fail = 0;
  for (const op of getOperationsBetween(operations, start, end)) {
    if (
      op.op_code === OperationType.INVITE &&
      op.data.is_joint_video === isJoint
    ) {
      if (inviteIsFulfilled[op.data.invite_token]) {
        success++;
      } else {
        fail++;
      }
    }
  }
  const total = success + fail;
  return [success / total, `(${success} / ${total})`]
}

/**
 * Returns "active creators" over a given duration which
 * means the number of verified users who have created a
 * public operation within the last 30 days.
 */
function getActiveCreators(
  operations: Operation[],
  members: Map<MemberId, Member>,
  durationDays: number,
  end: Date,
  onlyNew: boolean,
  strictActive: boolean
) {
  const memberIdSet = new Set();
  const start = getDaysAgo(durationDays, end);
  for (const op of getOperationsBetween(operations, start, end)) {
    if (strictActive && NOT_ACTIVE_OPS.has(op.op_code)) {
      continue;
    }
    const member = members.get(op.creator_uid);
    if (
      member &&
      member.get("isVerified") &&
      (!onlyNew || member.get("createdAt") > start)
    ) {
      memberIdSet.add(op.creator_uid);
    }
  }
  return memberIdSet;
}

function alertIfNotChronological(operations: Operation[]) {
  let prevTime = new Date(operations[0].created_at);
  for (let i = 1; i < operations.length; i++) {
    const currTime = new Date(operations[i].created_at);
    if (currTime < prevTime) {
      alert(
        "Sorry operations are out of order, metrics may be incorrect. Please email bugs@raha.app."
      );
      return;
    }
    prevTime = currTime;
  }
}

function getRetention(
  operations: Operation[],
  members: Map<MemberId, Member>,
  durationDays: number,
  end: Date,
  onlyNew: boolean
): [number, any] {
  const currActive = getActiveCreators(
    operations,
    members,
    durationDays,
    end,
    false,
    true
  );
  const prevActive = getActiveCreators(
    operations,
    members,
    durationDays,
    getDaysAgo(durationDays, end),
    onlyNew,
    true
  );
  const retainedMemberIds = [...currActive].filter(x => prevActive.has(x));
  const numRetained = retainedMemberIds.length;
  const retained = numRetained / prevActive.size;
  return [retained, `(${retainedMemberIds.length} / ${prevActive.size})`];
}

const MetricsView: React.StatelessComponent<Props> = props => {
  const { members, operations } = props;
  if (!operations || operations.length === 0) {
    return <Loading />;
  }
  alertIfNotChronological(operations);
  const now = new Date();
  const metricFrags = [];
  for (const durationDays of METRIC_DAYS) {
    metricFrags.push(<h4 key={`${durationDays}D`}>Last {durationDays} days:</h4>);
    for (const metricTemplate of METRIC_TEMPLATES) {
      const [[last, _], [curr, curr_m]] = [getDaysAgo(durationDays, now), now].map(end => {
        const metricArgs = {
          operations,
          members,
          durationDays,
          end
        }
        return metricTemplate.fn(metricArgs);
      });
      const change = (curr / last - 1.0) * 100;
      const changeStyle = change >= 0 ? {color: 'green'} : {color: 'red'};
      const [lastDis, currDisp]  = [last, curr].map(x => x <= 1.0 && x > 0.0 ? `${(x * 100).toFixed(2)}%` : x);
      metricFrags.push(
        <div title={metricTemplate.desc} key={`${durationDays}D${metricTemplate.name}M`}>
          {currDisp}{curr_m ? ` ${curr_m} ` : ' '} {metricTemplate.name}, <span style={changeStyle}>{`${change.toFixed(2)}%`}</span> from last ({lastDis})
        </div>
      );
    }
  }
  return (
    <section style={{ margin: "20px" }}>
      {metricFrags}
    </section>
  );
};

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  AppState
> = state => {
  return {
    operations: state.operations,
    members: state.membersNew.byMemberId
  };
};

export const Metrics = connect(mapStateToProps)(MetricsView);
