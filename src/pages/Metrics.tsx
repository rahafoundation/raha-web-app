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

/**
 * TODO this calculation should really be a cached (reselect?) connector.
 * TODO date and duration parameters.
 *
 * Returns MAC, our "monthly active creators" metric which
 * means the number of verified users who have created a
 * public operation within the last 30 days.
 */
function getMac(operations: Operation[], members: Map<MemberId, Member>) {
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  const memberIdSet = new Set();
  for (let i = operations.length - 1; i >= 0; i--) {
    const op = operations[i];
    if (new Date(op.created_at) < lastMonth) {
      break;
    }
    const member = members.get(op.creator_uid);
    if (member && member.get("isVerified")) {
      memberIdSet.add(op.creator_uid);
    }
  }
  return memberIdSet.size;
}

// TODO improve styling, don't rely on h1/h2/h3, add graphs
const MetricsView: React.StatelessComponent<Props> = props => {
  const { members, operations } = props;
  if (!operations || operations.length === 0) {
    return <Loading />;
  }
  return (
    <section style={{ margin: "20px" }}>
      <h2>MAC (Monthly Active Creators)</h2>
      <h3>
        How many verified members have created at least one operation in the
        last 30 days?
      </h3>
      <h1>{getMac(operations, members)}</h1>
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
