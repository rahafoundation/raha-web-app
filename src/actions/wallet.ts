import { AppState } from "../store";

import { ApiEndpoint, callApi, MintApiEndpoint, GiveApiEndpoint } from "../api";
import { Uid } from "../identifiers";
import { getAuthToken } from "../selectors/auth";
import UnauthenticatedError from "../errors/ApiCallError/UnauthenticatedError";
import { AsyncActionCreator, OperationsAction, OperationsActionType } from "./";
import { wrapApiCallAction } from "./apiCalls";

export const mint: AsyncActionCreator = (uid: Uid, amount: string) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const response = await callApi<MintApiEndpoint>(
        {
          endpoint: ApiEndpoint.MINT,
          params: undefined,
          body: {
            amount
          }
        },
        authToken
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [response]
      };
      dispatch(action);
    },
    ApiEndpoint.MINT,
    uid
  );
};

export const give: AsyncActionCreator = (
  uid: Uid,
  amount: string,
  memo?: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const response = await callApi<GiveApiEndpoint>(
        {
          endpoint: ApiEndpoint.GIVE,
          params: { uid },
          body: {
            amount,
            memo
          }
        },
        authToken
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [response]
      };
      dispatch(action);
    },
    ApiEndpoint.GIVE,
    uid
  );
};
