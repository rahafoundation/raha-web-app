// TODO: for all these action types, may make sense to use a
// Redux flux standard actions action creator lib, as the types get redundant

// TODO: consider splitting this into many pieces

import * as firebase from "firebase";
import { Action, ActionCreator, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";

import { list as callListOperations } from "@raha/api/dist/operations/list";
import { sendAppInstallText as callSendAppInstallText } from "@raha/api/dist/me/sendAppInstallText";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { Operation } from "@raha/api-shared/dist/models/Operation";

import { db } from "../firebaseInit";
import { MemberDoc, MemberEntry } from "../members";
import { AppState } from "../store";
import { wrapApiCallAction } from "./apiCalls";
// tslint:disable-next-line:no-var-requires
const CONFIG = require("../data/config.json");

export const RECEIVE_MEMBER = "RECEIVE_MEMBER";
export const REQUEST_MEMBER_BY_MID = "REQUEST_MEMBER_BY_MID";
export const REQUEST_MEMBER_BY_UID = "REQUEST_MEMBER_BY_UID";

export type AsyncAction = ThunkAction<void, AppState, void>;
export type AsyncActionCreator = ActionCreator<AsyncAction>;

// TODO: is there anything more specific than this?
export interface ReceiveMemberAction extends Action {
  type: typeof RECEIVE_MEMBER;
  memberDoc: MemberDoc | null; // TODO: is this supposed to be potentially null?
  id: string;
  byUsername: boolean;
  receivedAt: number;
}
export interface RequestMemberByMidAction extends Action {
  type: typeof REQUEST_MEMBER_BY_MID;
  username: string;
}
export interface RequestMemberByUidAction extends Action {
  type: typeof REQUEST_MEMBER_BY_UID;
  uid: string;
}

const requestMemberByUsername: ActionCreator<RequestMemberByMidAction> = (
  username: string
) => ({
  type: REQUEST_MEMBER_BY_MID,
  username
});

const requestMemberByUid: ActionCreator<RequestMemberByUidAction> = (
  uid: string
) => ({
  type: REQUEST_MEMBER_BY_UID,
  uid
});

const receiveMember: ActionCreator<ReceiveMemberAction> = (
  memberDoc: MemberDoc | null,
  id: string,
  byUsername: boolean
) => ({
  type: RECEIVE_MEMBER,
  id,
  byUsername,
  memberDoc,
  receivedAt: Date.now()
});

async function fetchMemberByMid(
  dispatch: Dispatch<AppState>,
  username: string
) {
  dispatch(requestMemberByUsername(username));
  const memberQuery = await db
    .collection("members")
    .where("username", "==", username)
    .get();
  if (memberQuery.docs.length > 1) {
    alert(
      `Found multiple matching member ${username}, please email bugs@raha.io`
    );
  }
  const memberDoc = memberQuery.docs.length === 1 ? memberQuery.docs[0] : null;
  dispatch(receiveMember(memberDoc, username, true));
}

async function fetchMemberByUid(dispatch: Dispatch<AppState>, uid: string) {
  dispatch(requestMemberByUid(uid));
  const memberDoc = await db
    .collection("members")
    .doc(uid)
    .get();
  // TODO error handling
  dispatch(receiveMember(memberDoc, uid, false));
}

function shouldFetchMember(member?: MemberEntry) {
  if (!member) {
    return true;
  }
  if (member.isFetching) {
    return false;
  }
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return oneDayAgo > member.receivedAt; // Re-fetch if over a day old. TODO improve this.
}

function shouldFetchMemberByUid(getState: () => AppState, uid: string) {
  const member = getState().members.byUid[uid];
  return shouldFetchMember(member);
}

function shouldFetchMemberByMid(getState: () => AppState, username: string) {
  const member = getState().members.byUsername[username];
  return shouldFetchMember(member);
}

export const fetchMemberByUidIfNeeded: AsyncActionCreator = (uid: string) => (
  dispatch,
  getState
) => {
  if (shouldFetchMemberByUid(getState, uid)) {
    fetchMemberByUid(dispatch, uid);
  }
};

export const fetchMemberByMidIfNeeded: AsyncActionCreator = (
  username: string
) => (dispatch, getState) => {
  if (shouldFetchMemberByMid(getState, username)) {
    fetchMemberByMid(dispatch, username);
  }
};

export const SET_FIREBASE_USER = "SET_FIREBASE_USER";

export interface SetFirebaseUserAction extends Action {
  type: typeof SET_FIREBASE_USER;
  firebaseUser: firebase.User;
}

const setFirebaseUser: ActionCreator<SetFirebaseUserAction> = (
  firebaseUser: firebase.User
) => ({
  type: SET_FIREBASE_USER,
  firebaseUser
});

export const authSetFirebaseUser: AsyncActionCreator = (
  firebaseUser: firebase.User
) => dispatch => {
  if (firebaseUser) {
    dispatch(fetchMemberByUidIfNeeded(firebaseUser.uid));
  }
  dispatch(setFirebaseUser(firebaseUser));
};

export enum OperationsActionType {
  SET_OPERATIONS = "SET_OPERATIONS",
  ADD_OPERATIONS = "ADD_OPERATIONS"
}
export interface SetOperationsAction {
  type: OperationsActionType.SET_OPERATIONS;
  operations: Operation[];
}
export interface AddOperationsAction {
  type: OperationsActionType.ADD_OPERATIONS;
  operations: Operation[];
}
export type OperationsAction = SetOperationsAction | AddOperationsAction;

// TODO: these operations methods are likely correct, but long term inefficient.
// We can rely on it now given that the number and size of operations are small,
// but later rely on cached results instead.
const _refreshOperations: ThunkAction<void, AppState, void> = wrapApiCallAction(
  async dispatch => {
    const { body } = await callListOperations(CONFIG.apiBase);
    const action: OperationsAction = {
      type: OperationsActionType.SET_OPERATIONS,
      operations: body
    };
    dispatch(action);
  },
  ApiEndpointName.GET_OPERATIONS,
  Date.now().toString()
);
export const refreshOperations: ActionCreator<typeof _refreshOperations> = () =>
  _refreshOperations;

export const applyOperation: AsyncActionCreator = (
  operation: Operation
) => async dispatch => {
  const action: AddOperationsAction = {
    type: OperationsActionType.ADD_OPERATIONS,
    operations: [operation]
  };
  dispatch(action);
};

export type MembersAction = SetOperationsAction | AddOperationsAction;
export const refreshMembers: AsyncActionCreator = () => {
  return async (dispatch, getState) => {
    // TODO: make this request cached members, not reconstruct from operations
    await _refreshOperations(dispatch, getState, undefined);
  };
};

export const sendAppInstallText: AsyncActionCreator = (
  mobileNumber: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      await callSendAppInstallText(CONFIG.apiBase, mobileNumber);
    },
    ApiEndpointName.SEND_APP_INSTALL_TEXT,
    mobileNumber
  );
};
