import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { Map } from "immutable";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { Operation } from "@raha/api-shared/dist/models/Operation";
import { AppState } from "../store";
import { Loading } from "../components/Loading";
import { Member } from "../reducers/membersNew";

interface OwnProps {}

interface StateProps {
  operations: Operation[];
  members: Map<MemberId, Member>;
}

type Props = OwnProps & StateProps;

function getDaysAgo(numDays: number, date?: Date) {
  const daysAgo = date ? new Date(date.getTime()) : new Date();
  daysAgo.setDate(daysAgo.getDate() - numDays);
  return daysAgo;
}

/**
 * TODO this calculation should really be a cached (reselect?) connector.
 *
 * Returns "active creators" over a given duration which
 * means the number of verified users who have created a
 * public operation within the last 30 days.
 */
function getActiveCreators(
  operations: Operation[],
  members: Map<MemberId, Member>,
  durationDays: number,
  endDate: Date
) {
  const startDate = new Date(endDate.getTime());
  startDate.setDate(startDate.getDate() - durationDays);
  const memberIdSet = new Set();
  for (let i = operations.length - 1; i >= 0; i--) {
    const op = operations[i];
    const createdAt = new Date(op.created_at);
    if (createdAt > endDate) {
      // TODO Inefficent - use binary search
      continue;
    }
    if (createdAt < startDate) {
      break;
    }
    const member = members.get(op.creator_uid);
    if (member && member.get("isVerified")) {
      memberIdSet.add(op.creator_uid);
    }
  }
  return memberIdSet.size;
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
  durationDays: number
) {
  const now = new Date();
  const curr = getActiveCreators(operations, members, durationDays, now);
  const last = getActiveCreators(
    operations,
    members,
    durationDays,
    getDaysAgo(durationDays, now)
  );
  const change = `${((curr / last - 1) * 100).toFixed(2)}%`;
  const description = `How many verified members have created at least one operation in the
  last ${durationDays} days?`;
  return [curr, last, change, description];
}

// TODO improve styling, don't rely on h1/h2/h3, add graphs
const MetricsView: React.StatelessComponent<Props> = props => {
  const { members, operations } = props;
  if (!operations || operations.length === 0) {
    return <Loading />;
  }
  alertIfNotChronological(operations);
  const [currMac, lastMac, changeMac, descMac] = getCurrAndLastActiveCreators(
    operations,
    members,
    30
  );
  const [currWac, lastWac, changeWac, descWac] = getCurrAndLastActiveCreators(
    operations,
    members,
    7
  );
  return (
    <section style={{ margin: "20px" }}>
      <h1 title={descMac as string}>{currMac} MAC Monthly Active Creators</h1>
      <h2>
        {changeMac} change from last month ({lastMac})
      </h2>
      <h1 title={descWac as string}>{currWac} WAC Weekly Active Creators</h1>
      <h2>
        {changeWac} change from last week ({lastWac})
      </h2>
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
