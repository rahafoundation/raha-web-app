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
import { Line } from "react-chartjs-2";

interface OwnProps {}

interface StateProps {
  operations: Operation[];
  members: Map<MemberId, Member>;
}

function randomScalingFactor() {
  return Math.random();
}

type Props = OwnProps & StateProps;

function getDaysAgo(numDays: number, date?: Date) {
  const daysAgo = date ? new Date(date.getTime()) : new Date();
  daysAgo.setDate(daysAgo.getDate() - numDays);
  return daysAgo;
}

function movingAvg(array: number[], count: number) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    const vals = array.slice(
      i - Math.max(0, i + count - array.length),
      i + count
    );
    const avg = vals.reduce((a, b) => a + b) / vals.length;
    result.push(avg);
  }
  return result;
}

const NOT_ACTIVE_OPS = new Set([
  OperationType.CREATE_MEMBER,
  OperationType.REQUEST_INVITE,
  OperationType.REQUEST_VERIFICATION
]);

function getInviteSuccess(
  operations: Operation[],
  members: Map<MemberId, Member>,
  is_joint_video: boolean
) {
  const inviteIsFulfilled: { [index: string]: boolean } = {};
  const recent = new Date(2018, 0, 0);
  for (const op of operations) {
    if (
      op.op_code === OperationType.INVITE &&
      op.data.is_joint_video === is_joint_video
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
  const labels: Date[] = [];
  const data_points: number[] = [];
  for (const op of operations) {
    const created_at = new Date(op.created_at);
    if (created_at < recent) {
      continue;
    }
    if (
      op.op_code === OperationType.INVITE &&
      op.data.is_joint_video === is_joint_video
    ) {
      labels.push(created_at);
      const success = inviteIsFulfilled[op.data.invite_token];
      data_points.push(success ? 1 : 0);
    }
  }
  // tslint:disable-next-line
  console.log('is joint', is_joint_video, 'succeeded', data_points.reduce((a, b) => a + b), '/', data_points.length)
  return movingAvg(data_points, 10).map((v, i) => ({ x: labels[i], y: v }));
}

function getInviteSuccessChart(
  operations: Operation[],
  members: Map<MemberId, Member>
) {
  const joint = getInviteSuccess(operations, members, true);
  const async = getInviteSuccess(operations, members, false);
  const data = {
    datasets: [
      {
        label: "Joint",
        backgroundColor: "red",
        borderColor: "red",
        data: joint,
        fill: false
      },
      {
        label: "Async",
        backgroundColor: "blue",
        borderColor: "blue",
        data: async,
        fill: false
      }
    ]
  };
  const options = {
    scales: {
      xAxes: [
        {
          type: "time"
        }
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Invite Acceptance Rate"
          }
        }
      ]
    }
  };
  return <Line data={data} options={options} />;
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
  endDate: Date,
  onlyNew: boolean,
  strictActive: boolean
) {
  const startDate = new Date(endDate.getTime());
  startDate.setDate(startDate.getDate() - durationDays);
  const memberIdSet = new Set();
  for (let i = operations.length - 1; i >= 0; i--) {
    const op = operations[i];
    if (strictActive && NOT_ACTIVE_OPS.has(op.op_code)) {
      continue;
    }
    const createdAt = new Date(op.created_at);
    if (createdAt > endDate) {
      // TODO Inefficent - use binary search
      continue;
    }
    if (createdAt < startDate) {
      break;
    }
    const member = members.get(op.creator_uid);
    if (
      member &&
      member.get("isVerified") &&
      (!onlyNew || member.get("createdAt") > startDate)
    ) {
      memberIdSet.add(op.creator_uid);
    }
  }
  return memberIdSet;
}

function getAC(
  operations: Operation[],
  members: Map<MemberId, Member>,
  durationDays: number,
  endDate: Date,
) {
  return null;
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

function getCurrAndLastActiveCreators(
  operations: Operation[],
  members: Map<MemberId, Member>,
  durationDays: number,
  strictActive: boolean
) {
  const now = new Date();
  const curr = getActiveCreators(
    operations,
    members,
    durationDays,
    now,
    false,
    strictActive
  ).size;
  const last = getActiveCreators(
    operations,
    members,
    durationDays,
    getDaysAgo(durationDays, now),
    false,
    strictActive
  ).size;
  const change = `${((curr / last - 1.0) * 100).toFixed(2)}%`;
  const description = `How many verified members have created at least one operation in the
  last ${durationDays} days?`;
  return [curr, last, change, description];
}

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

const METRIC_TEMPLATES: MetricTemplate[] = [
  {
    name: 'Active Creators',
    desc: 'How many verified members have created at lease one "active" operation?',
    fn: (args: MetricArgs) => [getActiveCreators(args.operations, args.members, args.durationDays, args.end, false, true).size, null]
  },
  {
    name: 'Operation Creators',
    desc: 'How many members have created at lease one operation?',
    fn: (args: MetricArgs) => [getActiveCreators(args.operations, args.members, args.durationDays, args.end, false, false).size, null]
  },
  {
    name: 'Member Retention',
    desc: 'How many members have created at lease one operation?',
    fn: (args: MetricArgs) => getRetention2(args.operations, args.members, args.durationDays, args.end, false)
  },
  {
    name: 'New Member Retention',
    desc: 'How many members have created at lease one operation?',
    fn: (args: MetricArgs) => getRetention2(args.operations, args.members, args.durationDays, args.end, true)
  }
];

const METRIC_DAYS = [7, 30];

function getRetention2(
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

function getRetention(
  operations: Operation[],
  members: Map<MemberId, Member>,
  durationDays: number,
  onlyNew: boolean
) {
  const now = new Date();
  const curr = getActiveCreators(
    operations,
    members,
    durationDays,
    now,
    false,
    true
  );
  const prevNew = getActiveCreators(
    operations,
    members,
    durationDays,
    getDaysAgo(durationDays, now),
    onlyNew,
    true
  );
  const retainedMemberIds = [...curr].filter(x => prevNew.has(x));
  const numRetained = retainedMemberIds.length;
  const change = `${(numRetained / prevNew.size * 100).toFixed(2)}%`;
  const description = `How many active ${
    onlyNew ? "new " : ""
  }members from ${getDaysAgo(
    durationDays * 2,
    now
  ).toLocaleDateString()} to ${getDaysAgo(
    durationDays,
    now
  ).toLocaleDateString()} created at least one transaction in the next ${durationDays} days?`;
  return [numRetained, prevNew.size, change, description];
}

function getRetentionTile(
  operations: Operation[],
  members: Map<MemberId, Member>,
  durationDays: number,
  onlyNew: boolean
) {
  const [curr, last, retention, descRetention] = getRetention(
    operations,
    members,
    durationDays,
    onlyNew
  );
  return (
    <div>
      <h1 title={descRetention as string}>{`${retention} - ${durationDays}D ${
        onlyNew ? "New" : "Overall"
      } Retention (${curr} / ${last})`}</h1>
    </div>
  );
}

// TODO improve styling, don't rely on h1/h2/h3, add graphs
const MetricsView: React.StatelessComponent<Props> = props => {
  const { members, operations } = props;
  if (!operations || operations.length === 0) {
    return <Loading />;
  }
  alertIfNotChronological(operations);
  const now = new Date();
  const metricFrags = [];
  for (const durationDays of METRIC_DAYS) {
    metricFrags.push(<h4>Last {durationDays} days:</h4>);
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
      const change = `${((curr / last - 1.0) * 100).toFixed(2)}%`;
      const [lastDis, currDisp]  = [last, curr].map(x => x <= 1.0 && x > 0.0 ? `${(x * 100).toFixed(2)}%` : x);
      metricFrags.push(
        <div title={metricTemplate.desc}>
          {currDisp}{curr_m ? ` ${curr_m} ` : ' '} {metricTemplate.name} (a {change} change from last val of {lastDis})
        </div>
      );
    }
  }
  const [currMac, lastMac, changeMac, descMac] = getCurrAndLastActiveCreators(
    operations,
    members,
    30,
    true
  );
  const [currWac, lastWac, changeWac, descWac] = getCurrAndLastActiveCreators(
    operations,
    members,
    7,
    true
  );
  const [currWoc, lastWoc, changeWoc, descWok] = getCurrAndLastActiveCreators(
    operations,
    members,
    7,
    false
  );
  return (
    <section style={{ margin: "20px" }}>
      {metricFrags}
      <h1 title={descWok as string}>
        {currWoc} WOC Weekly Op Creators - {changeWoc} change from last week ({
          lastWoc
        })
      </h1>
      <h1 title={descMac as string}>
        {currMac} MAC Monthly Active Creators - {changeMac} change from last
        month ({lastMac})
      </h1>
      <h1 title={descWac as string}>
        {currWac} WAC Weekly Active Creators - {changeWac} change from last week
        ({lastWac})
      </h1>
      {getRetentionTile(operations, members, 7, true)}
      {getRetentionTile(operations, members, 7, false)}
      {getRetentionTile(operations, members, 30, true)}
      {getRetentionTile(operations, members, 30, false)}
      {getInviteSuccessChart(operations, members)}
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
