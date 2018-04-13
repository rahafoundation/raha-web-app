import { Reducer } from "redux";
import { ApiEndpoint } from "../api";
import { ApiCallsAction, ApiCallsActionType } from "../actions/apiCalls";
import ApiCallError from "../errors/ApiCallError";

export enum ApiCallStatusType {
  STARTED = "STARTED",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE"
}
export type ApiCallStatus =
  | {
      status: ApiCallStatusType.STARTED | ApiCallStatusType.SUCCESS;
    }
  | {
      status: ApiCallStatusType.FAILURE;
      error: ApiCallError;
    };

export type ApiCallsState = {
  readonly [key in ApiEndpoint]?: { [identifier: string]: ApiCallStatus }
};

export const reducer: Reducer<ApiCallsState> = (
  prevState = {},
  untypedAction
) => {
  const action = untypedAction as ApiCallsAction;
  switch (action.type) {
    case ApiCallsActionType.STARTED: {
      return {
        ...prevState,
        [action.endpoint]: {
          ...(action.endpoint in prevState ? prevState[action.endpoint] : {}),
          [action.identifier]: { status: ApiCallStatusType.STARTED }
        }
      };
    }
    case ApiCallsActionType.SUCCESS:
      return {
        ...prevState,
        [action.endpoint]: {
          ...(action.endpoint in prevState ? prevState[action.endpoint] : {}),
          [action.identifier]: { status: ApiCallStatusType.SUCCESS }
        }
      };
    case ApiCallsActionType.FAILURE:
      return {
        ...prevState,
        [action.endpoint]: {
          ...(action.endpoint in prevState ? prevState[action.endpoint] : {}),
          [action.identifier]: {
            status: ApiCallStatusType.FAILURE,
            error: action.error
          }
        }
      };
    default:
      return prevState;
  }
};
