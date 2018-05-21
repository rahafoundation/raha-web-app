import { Reducer } from "redux";

import { Uid, Username, Id } from "../identifiers";
import { OperationsAction, OperationsActionType } from "../actions";

export enum OperationType {
  REQUEST_INVITE = "REQUEST_INVITE",
  TRUST = "TRUST"
}
export interface RequestInvitePayload {
  full_name: string;
  to_uid: Uid;
  username: Username;
}
export interface TrustPayload {
  to_uid: Uid;
}

export interface OperationBase {
  id: Uid;
  creator_uid: Uid;
}

export type Operation = OperationBase &
  (
    | {
        op_code: OperationType.REQUEST_INVITE;
        data: RequestInvitePayload;
      }
    | {
        op_code: OperationType.TRUST;
        data: TrustPayload;
      });

export type OperationsState = Operation[];

export const reducer: Reducer<OperationsState> = (
  state = [],
  untypedAction
) => {
  const action = untypedAction as OperationsAction;
  switch (action.type) {
    case OperationsActionType.SET_OPERATIONS:
      return action.operations;
    case OperationsActionType.ADD_OPERATIONS:
      return [...state, ...action.operations];
    default:
      return state;
  }
};
