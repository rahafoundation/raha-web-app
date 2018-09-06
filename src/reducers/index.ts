import { combineReducers } from "redux";
import { routerReducer, RouterState } from "react-router-redux";

// TODO: get rid of the two below reducers
import { members, MembersState } from "./members";

import { OperationsState, reducer as operations } from "./operations";
import {
  MembersState as NewMembersState,
  reducer as membersNew
} from "./membersNew";
import { ApiCallsState, reducer as apiCalls } from "./apiCalls";

import { auth, AuthState } from "./auth";

export interface AppState {
  members: MembersState; // TODO: nuke this
  membersNew: NewMembersState;
  auth: AuthState;
  operations: OperationsState;
  apiCalls: ApiCallsState;
  router: RouterState;
}
const rootReducer = combineReducers({
  members, // TODO: nuke this
  membersNew,
  auth,
  operations,
  apiCalls,
  router: routerReducer
});

export { rootReducer };
