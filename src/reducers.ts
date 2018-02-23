import { OpActionTypes, RECEIVE_MEMBER, REQUEST_MEMBER, OpActions, ReceiveOps } from './actions';

import { combineReducers, Action } from 'redux';

interface MemberAction {
  type: string;
  value: {
    uid: string
  };
}

// tslint:disable-next-line:no-any
type MembersState = Map<string, any>;

// tslint:disable-next-line:no-any
type OperationsState = Map<string, any>;

function uidToMembers(state: MembersState = {} as MembersState, action: MemberAction) {
  switch (action.type) {
    case RECEIVE_MEMBER:
    case REQUEST_MEMBER:
      const { uid, ...value } = action.value;
      return {
        ...state,
        [uid]: value
      };
    default:
      return state;
  }
}

function uidToOperations(state: OperationsState = {} as OperationsState, action: OpActions) {
  console.log(ReceiveOps);
  console.log(OpActionTypes);
  debugger;
  switch (action.type) {
    case OpActionTypes.ReceiveOps:
      console.log('reached ReceiveOps', action);
    case OpActionTypes.PostOp:
      console.log('reached PostOp', action);
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  uidToMembers,
  uidToOperations
});

export default rootReducer;
