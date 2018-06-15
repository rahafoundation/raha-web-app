import { ApiEndpointName } from "@raha.app/api";

import { ApiCallStatus } from "../reducers/apiCalls";
import { AppState } from "../store";

/**
 * Gets the status of a previously made API call.
 * @returns If API call has been made, returns its status; otherwise, returns
 * null.
 */
export function getStatusOfApiCall(
  state: AppState,
  endpoint: ApiEndpointName,
  identifier: string
): ApiCallStatus | undefined {
  const apiCallsForEndpoint = state.apiCalls[endpoint];
  if (apiCallsForEndpoint === undefined) {
    return undefined;
  }
  const apiCallStatus = apiCallsForEndpoint[identifier];
  if (apiCallStatus === undefined) {
    return undefined;
  }

  return apiCallStatus;
}
