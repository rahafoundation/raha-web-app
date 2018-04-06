import { Action, combineReducers, Reducer } from 'redux';
import members, { MembersState } from './members';
import modal, { ModalState } from './modal';
import {
  UidToOpMetaState,
  uidToOpMeta,
  operations,
  OperationsState
} from './operations';
import auth, { AuthState } from "./auth";

export interface AppState {
  members: MembersState;
  uidToOpMeta: UidToOpMetaState;
  auth: AuthState;
  operations: OperationsState;
  modal: ModalState;
}
const rootReducer = combineReducers({
  members,
  uidToOpMeta,
  auth,
  operations,
  modal
});

export default rootReducer;
