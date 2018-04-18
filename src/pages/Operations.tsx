// TODO: remove this component when it is no longer desired.
import * as React from "react";
import { connect } from "react-redux";

import { AppState } from "../reducers";
import { OperationsState } from "../reducers/operations";

interface OwnProps {}
interface StateProps {
  ops: OperationsState;
}
interface DispatchProps {}
type Props = OwnProps & StateProps & DispatchProps;

const Operations: React.StatelessComponent<Props> = ({ ops }) => (
  <div>
    <h1>Operations stream</h1>
    <span>{JSON.stringify(ops)}</span>
  </div>
);

function mapStateToProps(state: AppState): StateProps {
  return { ops: state.operations };
}

export default connect(mapStateToProps)(Operations);
