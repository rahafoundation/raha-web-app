import { ApiEndpointName } from "@raha.app/api";
import mintCall from "@raha.app/api/dist/me/mint";
import giveCall from "@raha.app/api/dist/members/give";
import UnauthenticatedError from "@raha.app/api/dist/errors/UnauthenticatedError";

import { Uid } from "../identifiers";
import { getAuthToken } from "../selectors/auth";
import { AsyncActionCreator, OperationsAction, OperationsActionType } from "./";
import { wrapApiCallAction } from "./apiCalls";
import { Big } from "big.js";

// tslint:disable-next-line:no-var-requires
const CONFIG = require("../data/config.json");

export const mint: AsyncActionCreator = (uid: Uid, amount: Big) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const response = await mintCall(CONFIG.apiBase, authToken, amount);

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [response.body]
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

      const response = await giveCall(CONFIG.apiBase, authToken, uid, amount);

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [response.body]
      };
      dispatch(action);
    },
    ApiEndpointName.GIVE,
    uid
  );
};
