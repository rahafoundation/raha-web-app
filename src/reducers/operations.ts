import { Reducer } from "redux";

import { Operation } from "@raha/api-shared/models/Operation";

import { OperationsAction, OperationsActionType } from "../actions";

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
