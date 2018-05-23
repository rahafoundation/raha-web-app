import { Reducer } from "redux";

import { Uid, Username, Id } from "../identifiers";
import { OperationsAction, OperationsActionType } from "../actions";

export enum OperationType {
  REQUEST_INVITE = "REQUEST_INVITE",
  TRUST = "TRUST",
  MINT = "MINT"
}

export interface RequestInvitePayload {
  full_name: string;
  to_uid: Uid;
  username: Username;
}
export interface TrustPayload {
  to_uid: Uid;
}
export interface MintPayload {
  amount: string;
}

export interface OperationBase {
  id: Uid;
  creator_uid: Uid;
  created_at: string;
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
      }
    | {
        op_code: OperationType.MINT;
        data: MintPayload;
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
