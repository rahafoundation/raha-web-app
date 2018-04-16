import { Reducer } from "redux";
import { ApiEndpoint } from "../api";
import { ApiCallsAction, ApiCallsActionType } from "../actions/apiCalls";
import ApiCallError from "../errors/ApiCallError";

export enum ApiCallStatusType {
  STARTED = "STARTED",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE"
}
export interface ApiCallStatus {
  status:
    | ApiCallStatusType.STARTED
    | ApiCallStatusType.SUCCESS
    | ApiCallStatusType.FAILURE;
}

export type ApiCallsState = {
  readonly [key in ApiEndpoint]?: { [identifier: string]: ApiCallStatus }
};

export const reducer: Reducer<ApiCallsState> = (
  prevState = {},
  untypedAction
) => {
  const action = untypedAction as ApiCallsAction;
  let status: ApiCallStatusType;
  switch (action.type) {
    default:
      return prevState;
    case ApiCallsActionType.STARTED:
      status = ApiCallStatusType.STARTED;
      break;
    case ApiCallsActionType.SUCCESS:
      status = ApiCallStatusType.SUCCESS;
      break;
    case ApiCallsActionType.FAILURE:
      status = ApiCallStatusType.FAILURE;
      break;
  }
  return {
    ...prevState,
    [action.endpoint]: {
      ...(action.endpoint in prevState ? prevState[action.endpoint] : {}),
      [action.identifier]: { status }
    }
  };
};
