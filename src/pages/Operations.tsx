// TODO: remove this component when it is no longer desired.
import * as React from "react";
import { connect } from "react-redux";

import { fetchOperations } from "../actions";
import { db } from "../firebaseInit";
import { OperationsState } from "../reducers/operations";
import { AppState } from "../store";

interface OwnProps {}
interface StateProps {
  ops: OperationsState;
}
interface DispatchProps {
  fetchOperations: typeof fetchOperations;
}
type Props = OwnProps & StateProps & DispatchProps;

export class Operations extends React.Component<Props> {
  public componentDidMount() {
    this.props.fetchOperations(db.collection("operations"));
  }

  public render() {
    return (
      <div>
        <h1>Operations stream</h1>
        <span>{JSON.stringify(this.props.ops)}</span>
      </div>
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return { ops: state.operations };
}

export default connect(mapStateToProps, { fetchOperations })(Operations);
