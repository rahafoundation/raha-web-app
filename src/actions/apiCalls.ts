import { ApiEndpoint } from "../api";
import ApiCallError from "../errors/ApiCallError";
import { AsyncAction } from ".";

export const enum ApiCallsActionType {
  STARTED = "STARTED",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE"
}

export interface ApiCallsActionBase {
  endpoint: ApiEndpoint;
  identifier: string;
}

interface ApiCallStartedAction extends ApiCallsActionBase {
  type: ApiCallsActionType.STARTED;
}
interface ApiCallSuccessAction extends ApiCallsActionBase {
  type: ApiCallsActionType.SUCCESS;
}
interface ApiCallFailedAction extends ApiCallsActionBase {
  type: ApiCallsActionType.FAILURE;
  error: ApiCallError;
}
export type ApiCallsAction =
  | ApiCallStartedAction
  | ApiCallSuccessAction
  | ApiCallFailedAction;

/**
 * Wrap an action that runs an API call, so that:
 * a) Errors from failed API calls are caught, and
 * b) The state of the API request is logged.
 *
 * @param asyncAction API call redux action to be wrapped
 * @param endpoint API endpoint being hit
 * @param identifier A way of identifying the outgoing API call. For example, if
 * the logged in user calls the API to trust another user, that other user's UID
 * would work. These should be unique, especially for non-idempotent calls, so
 * that they don't overwrite the state of earlier calls to the same endpoint.
 *
 * TODO: come up with a way to overcome this restriction.
 */
export const wrapApiCallAction: (
  asyncAction: AsyncAction,
  endpoint: ApiEndpoint,
  identifier: string
) => AsyncAction = (asyncAction, endpoint, identifier) => {
  return async (dispatch, getState, extraArgument) => {
    try {
      const startedAction: ApiCallsAction = {
        type: ApiCallsActionType.STARTED,
        endpoint,
        identifier
      };
      dispatch(startedAction);

      const result = await asyncAction(dispatch, getState, extraArgument);

      const successAction: ApiCallsAction = {
        type: ApiCallsActionType.SUCCESS,
        endpoint,
        identifier
      };
      dispatch(successAction);
      return result;
    } catch (err) {
      if (err instanceof ApiCallError) {
        const failureAction: ApiCallsAction = {
          type: ApiCallsActionType.FAILURE,
          endpoint,
          identifier,
          error: err
        };
        dispatch(failureAction);
        return;
      }
      throw err;
    }
  };
};
