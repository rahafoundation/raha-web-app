import { ApiEndpoint } from "../api";
import { ApiCallStatusType, ApiCallStatus } from "../reducers/apiCalls";
import { AppState } from "../store";

/**
 * Gets the status of a previously made API call.
 * @returns If API call has been made, returns its status; otherwise, returns
 * null.
 */
export function getStatusOfApiCall(
  state: AppState,
  endpoint: ApiEndpoint,
  identifier: string
): ApiCallStatus | null {
  const apiCallsForEndpoint = state.apiCalls[endpoint];
  if (apiCallsForEndpoint === undefined) {
    return null;
  }
  const apiCallStatus = apiCallsForEndpoint[identifier];
  if (apiCallStatus === undefined) {
    return null;
  }

  return apiCallStatus;
}
