import { Big } from "big.js";

import { UnauthenticatedError } from "@raha/api/dist/client/errors/UnauthenticatedError";
import { mint as callMint } from "@raha/api/dist/client/me/mint";
import { give as callGive } from "@raha/api/dist/client/members/give";
import { MintType } from "@raha/api/dist/shared/models/Operation";
import { ApiEndpointName } from "@raha/api/dist/shared/types/ApiEndpoint";

import { Uid } from "../identifiers";
import { getAuthToken } from "../selectors/auth";
import { AsyncActionCreator, OperationsAction, OperationsActionType } from "./";
import { wrapApiCallAction } from "./apiCalls";
// tslint:disable-next-line:no-var-requires
const CONFIG = require("../data/config.json");

export const mint: AsyncActionCreator = (uid: Uid, amount: Big) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const { body } = await callMint(CONFIG.apiBase, authToken, {
        amount,
        type: MintType.BASIC_INCOME
      });

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.MINT,
    uid
  );
};

export const give: AsyncActionCreator = (
  uid: Uid,
  amount: Big,
  memo?: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const { body } = await callGive(
        CONFIG.apiBase,
        authToken,
        uid,
        amount,
        memo
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.GIVE,
    uid
  );
};
