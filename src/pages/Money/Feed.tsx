import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { AppState } from "../../store";
import { Member } from "../../reducers/membersNew";
import { Operation, OperationType } from "../../reducers/operations";
import { getMemberOperations } from "../../selectors/operations";

import OperationList from "../../components/OperationList";

interface OwnProps {
  loggedInMember: Member;
}

interface StateProps {
  operations: Operation[];
}

type Props = OwnProps & StateProps;

const FeedView: React.StatelessComponent<Props> = props => {
  const { operations } = props;
  return (
    <section>
      <h1>Your activity</h1>
      <OperationList operations={operations.reverse()} />
    </section>
  );
};

/* ================
 * Redux container
 * ================
 */
const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state,
  ownProps
) => {
  return {
    operations: getMemberOperations(state, ownProps.loggedInMember.uid).filter(
      op =>
        op.op_code === OperationType.MINT || op.op_code === OperationType.GIVE
    )
  };
};

export default connect(mapStateToProps)(FeedView);
