import { Reducer } from "redux";

import {
  ACKP_POST_OP,
  AckpPostOpAction,
  POST_OP,
  PostOpAction,
  RECEIVE_OPS,
  ReceiveOpsAction,
} from "../actions";

import {
  OpDoc,
  Operation,
  OpMeta,
} from '../operations';

interface OpMap { [id: string]: Operation }

/**
 * Helper function to parse operations and add them to
 * existing state.
 */
function parseOps(ops: OpMap, opDocs: OpDoc[]): OpMap {
  const newOps = opDocs.reduce(
    (res, d) => {
      res[d.id] = { uid: d.id, op: d.data(), inDb: true };
      return res;
    },
    {} as OpMap
  );
  return { ...ops, ...newOps };
}

type UidToOpMetaAction = ReceiveOpsAction | PostOpAction | AckpPostOpAction;
export type UidToOpMetaState = OpMap;

export const uidToOpMeta: Reducer<UidToOpMetaState> = (
  state = {}, untypedAction
) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as UidToOpMetaAction;

  switch (action.type) {
    case RECEIVE_OPS:
      return parseOps(state, action.opDocs);
    case POST_OP:
    case ACKP_POST_OP:
      const { uid, ...value } = action.value;
      const updatedOp = { [uid]: { ...state[uid], ...value } };
      return { ...state, ...updatedOp };
    default:
      return state;
  }
};

type OperationsAction = ReceiveOpsAction;
export type OperationsState = OpMap;

/**
 * This is a simple container for received operations.
 */
export const operations: Reducer<OpMap> = (state = {}, untypedAction) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as OperationsAction;
  switch (action.type) {
    case RECEIVE_OPS:
      return parseOps(state, action.opDocs);
    default:
      return state;
  }
};

