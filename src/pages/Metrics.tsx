import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { Map } from "immutable";
import Big from "big.js";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  Operation,
  OperationType
} from "@raha/api-shared/dist/models/Operation";
import { AppState } from "../store";
import { Loading } from "../components/Loading";
import { Member, MembersState, applyOperation } from "../reducers/membersNew";

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
  },
  {
    name: 'Bottom 50% Gross Income Share',
    desc: 'Of the bottom 40% by gross income made in the last time period, what percent of total gross income went to them?',
    fn: (args: MetricArgs) => getQuantileIncome(args.operations, args.durationDays, args.end, 0.5)
  },
  {
    name: 'Raha In Circulation',
    desc: 'How much Raha is in circulation? The change gives us inflation rate',
    fn: (args: MetricArgs) => [+getCirculationByOperations(args.operations, args.end), null]
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

function getIncomeByMember(
  operations: Operation[],
  durationDays: number,
  end: Date,
  grossIncome: boolean  // If true measure gross income, else measure net
) {
  let membersCurr: MembersState = {byMemberId: Map(), byMemberUsername: Map()};
  const incomeByMember: { [index: string]: Big } = {};
  const start = getDaysAgo(durationDays, end);
  const INCOME_OP_TYPES = new Set([
    OperationType.MINT,
    OperationType.GIVE
  ])
  for (const op of operations) {
    const membersNext = applyOperation(membersCurr, op);
    if (new Date(op.created_at) >= end) {
      break;
    }
    if (new Date(op.created_at) >= start && INCOME_OP_TYPES.has(op.op_code)) {
      for (const id of [op.creator_uid, (op.data as any).to_uid]) {
        if (id) {
          const [balCurr, balNext] = [membersCurr, membersNext].map(memState => {
            const mem = memState.byMemberId.get(id);
            if (!mem) {
              throw new Error(`Bad mid ${id} for op type ${op.op_code}`);
            }
            return mem.get("balance");
          });
          const totalIncome = incomeByMember[id] || Big(0);
          const income = balNext.minus(balCurr);
          if (!grossIncome || income.gt(0)) {
            incomeByMember[id] = totalIncome.plus(income);
          }
        }
      }
    }
    membersCurr = membersNext;
  }
  return incomeByMember;
}

/**
 * Get the total gross incomes share for the bottom of the given quantile.
 * On Raha the bottom 50% tends to get well over 10% of the total gross
 * income share, compared to globally by market exchange rates it's
 * usually about 6% - see https://wir2018.wid.world/part-2.html.
 * We use gross income because it's more similar to the pre-tax incomes
 * estimates used in the WID figure. One disadvantage of using gross income
 * is that high velocity cycles between 2 or more individuals could distort
 * this measure, ideally we would not count fast cyclical transfers over.
 */
function getQuantileIncome(
  operations: Operation[],
  durationDays: number,
  end: Date,
  quantile: number
): [number, string] {
  const incomes = Object.values(getIncomeByMember(operations, durationDays, end, true));
  incomes.sort((a, b) => +a.minus(b));
  const index = incomes.length * quantile;
  const bottom = incomes.slice(0, index);
  const [bottomSum, total] = [bottom, incomes].map(x => x.reduce((a, b) => a.plus(b)));
  return [+bottomSum.div(total), `(${bottomSum} / ${total})`];
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

function alertIfCirculationNotMatch(
  operations: Operation[],
  members: Map<MemberId, Member>
) {
  const circOp = getCirculationByOperations(operations, new Date());
  const circMemb = getCirculationByMember(members);
  if (!circMemb.eq(circOp)) {
    alert(
      `Sorry getting conflicting reports for circultation, ${circMemb} != ${circOp} (ops). Please email bugs@raha.app.`
    );
  }
}

function getCirculationByMember(members: Map<MemberId, Member>) {
  return members.valueSeq().toArray().map(m => m.get("balance")).reduce((a, b) => a.plus(b));
}

function getCirculationByOperations(operations: Operation[], end: Date) {
  return Object.values(getIncomeByMember(operations, 10 * 1000 * 1000, end, false)).reduce((a, b) => a.plus(b));
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
  alertIfCirculationNotMatch(operations, members);
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
