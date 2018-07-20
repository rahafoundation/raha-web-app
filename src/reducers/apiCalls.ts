import { Reducer } from "redux";

import { ApiEndpointName } from "@raha/api/dist/shared/types/ApiEndpoint";
import { ApiCallError } from "@raha/api/dist/client/errors";

import { ApiCallsAction, ApiCallsActionType } from "../actions/apiCalls";

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
  error?: ApiCallError;
}

export type ApiCallsState = {
  readonly [key in ApiEndpointName]?: { [identifier: string]: ApiCallStatus }
};

export const reducer: Reducer<ApiCallsState> = (
  prevState = {},
  untypedAction
) => {
  const action = untypedAction as ApiCallsAction;
  let apiCallStatus: ApiCallStatus;
  switch (action.type) {
    default:
      return prevState;
    case ApiCallsActionType.STARTED:
      apiCallStatus = { status: ApiCallStatusType.STARTED };
      break;
    case ApiCallsActionType.SUCCESS:
      apiCallStatus = { status: ApiCallStatusType.SUCCESS };
      break;
    case ApiCallsActionType.FAILURE:
      apiCallStatus = {
        status: ApiCallStatusType.FAILURE,
        error: action.error
      };
      break;
  }

  return {
    ...prevState,
    [action.endpoint]: {
      ...(action.endpoint in prevState ? prevState[action.endpoint] : {}),
      [action.identifier]: apiCallStatus
    }
  };
};
