import { Action, combineReducers, Reducer } from 'redux';
import modal, { ModalState } from './modal';

// TODO: get rid of the two below reducers
import members, { MembersState } from './members';
import {
  UidToOpMetaState,
  uidToOpMeta,
  operations,
  OperationsState
} from './operations';

import { OperationsState as NewOperationsState, reducer as operationsNew } from './operationsNew';
import { MembersState as NewMembersState, reducer as membersNew } from './membersNew';

import auth, { AuthState } from "./auth";

export interface AppState {
  members: MembersState; // TODO: nuke this
  membersNew: NewMembersState;
  uidToOpMeta: UidToOpMetaState;
  auth: AuthState;
  operations: OperationsState; // TODO: nuke this
  operationsNew: NewOperationsState;
  modal: ModalState;
}
const rootReducer = combineReducers({
  members, // TODO: nuke this
  membersNew,
  uidToOpMeta,
  auth,
  operations, // TODO: nuke this
  operationsNew,
  modal
});

export default rootReducer;
