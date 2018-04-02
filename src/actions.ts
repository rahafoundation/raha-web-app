// TODO: for all these action types, may make sense to use a
// Redux flux standard actions action creator lib, as the types get redundant

import * as firebase from 'firebase';
import { Action, ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { db } from './firebaseInit';
import { MemberDoc, MemberEntry } from './members';
import { OpDoc, Operation, OperationData, OpMeta } from './operations';
import { AppState } from './store';

// member_actions.js

export const RECEIVE_MEMBER = 'RECEIVE_MEMBER';
export const REQUEST_MEMBER_BY_MID = 'REQUEST_MEMBER_BY_MID';
export const REQUEST_MEMBER_BY_UID = 'REQUEST_MEMBER_BY_UID';
export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

// TODO: is there anything more specific than this?
export interface ReceiveMemberAction extends Action {
  type: typeof RECEIVE_MEMBER;
  memberDoc: MemberDoc | null; // TODO: is this supposed to be potentially null?
  id: string;
  byMid: boolean;
  receivedAt: number;
}
export interface RequestMemberByMidAction extends Action {
  type: typeof REQUEST_MEMBER_BY_MID;
  mid: string;
}
export interface RequestMemberByUidAction extends Action {
  type: typeof REQUEST_MEMBER_BY_UID;
  uid: string;
}

const requestMemberByMid: ActionCreator<RequestMemberByMidAction> = (mid: string) => ({
  type: REQUEST_MEMBER_BY_MID,
  mid,
});

const requestMemberByUid: ActionCreator<RequestMemberByUidAction> = (uid: string) => ({
  type: REQUEST_MEMBER_BY_UID,
  uid,
});

const receiveMember: ActionCreator<ReceiveMemberAction> = (
  memberDoc: MemberDoc | null, id: string, byMid: boolean
) => ({
  type: RECEIVE_MEMBER,
  id,
  byMid,
  memberDoc,
  receivedAt: Date.now(),
});

export interface HideModalAction extends Action {
  type: typeof HIDE_MODAL;
}
export interface ShowModalAction extends Action {
  type: typeof SHOW_MODAL;
  element: React.ReactNode;
}

export const showModal: ActionCreator<ShowModalAction> = (element: React.ReactNode) => ({
  type: SHOW_MODAL,
  element
});

export const hideModal: ActionCreator<HideModalAction> = () => ({
  type: HIDE_MODAL
});

async function fetchMemberByMid(dispatch: Dispatch<AppState>, mid: string) {
  dispatch(requestMemberByMid(mid));
  const memberQuery = await db.collection('members').where('mid', '==', mid).get();
  if (memberQuery.docs.length > 1) {
    alert(`Found multiple matching member ${mid}, please email bugs@raha.io`);
  }
  const memberDoc = memberQuery.docs.length === 1 ? memberQuery.docs[0] : null;
  dispatch(receiveMember(memberDoc, mid, true));
}

async function fetchMemberByUid(dispatch: Dispatch<AppState>, uid: string) {
  dispatch(requestMemberByUid(uid));
  const memberDoc = await db.collection('members').doc(uid).get();
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
  return oneDayAgo > member.receivedAt;  // Re-fetch if over a day old. TODO improve this.
}

function shouldFetchMemberByUid(getState: () => AppState, uid: string) {
  const member = getState().members.byUid[uid];
  return shouldFetchMember(member);
}

function shouldFetchMemberByMid(getState: () => AppState, mid: string) {
  const member = getState().members.byMid[mid];
  return shouldFetchMember(member);
}

export const fetchMemberByUidIfNeeded: ActionCreator<ThunkAction<void, AppState, void>> =
  (uid: string) => (dispatch, getState) => {
    if (shouldFetchMemberByUid(getState, uid)) {
      fetchMemberByUid(dispatch, uid);
    }
  };

export const fetchMemberByMidIfNeeded: ActionCreator<ThunkAction<void, AppState, void>> =
  (mid: string) => (dispatch, getState) => {
    if (shouldFetchMemberByMid(getState, mid)) {
      fetchMemberByMid(dispatch, mid);
    }
  };

// op_actions.js

export const RECEIVE_OPS = 'RECEIVE_OPS';
export const POST_OP = 'POST_OP';
export const ACKP_POST_OP = 'ACKP_POST_OP';

export interface ReceiveOpsAction extends Action {
  type: typeof RECEIVE_OPS;
  opDocs: OpDoc[];
}
export interface PostOpAction extends Action {
  type: typeof POST_OP;
  value: Operation;
}
export interface AckpPostOpAction extends Action {
  type: typeof ACKP_POST_OP;
  value: OpMeta;
}

const postOp: ActionCreator<PostOpAction> = (uid: string, op: Operation) => ({
  type: POST_OP,
  value: {
    uid,
    op,
    inDb: false
  }
});

const ackPostOp: ActionCreator<AckpPostOpAction> = (uid: string) => ({
  type: ACKP_POST_OP,
  value: {
    uid,
    inDb: true
  }
});

export const postOperation: ActionCreator<ThunkAction<void, AppState, void>> =
  (op: OperationData) => async dispatch => {
    const opDoc = db.collection('operations').doc();
    dispatch(postOp(opDoc.id, op));
    await opDoc.set(op);
    dispatch(ackPostOp(opDoc.id));
  };

const receiveOperations: ActionCreator<ReceiveOpsAction> =
  (opDocs: firebase.firestore.DocumentSnapshot[]) => ({
    type: RECEIVE_OPS,
    opDocs
  });

export const fetchOperations: ActionCreator<ThunkAction<void, AppState, void>> =
  (query: firebase.firestore.Query) => async dispatch => {
    const snap = await query.get();
    dispatch(receiveOperations(snap.docs));
  };

// auth_actions.js

export const SET_FIREBASE_USER = 'SET_FIREBASE_USER';

export interface SetFirebaseUserAction extends Action {
  type: typeof SET_FIREBASE_USER;
  firebaseUser: firebase.User;
}

const setFirebaseUser: ActionCreator<SetFirebaseUserAction> =
  (firebaseUser: firebase.User) => ({
    type: SET_FIREBASE_USER,
    firebaseUser
  });

export const authSetFirebaseUser: ActionCreator<ThunkAction<void, AppState, void>> =
  (firebaseUser: firebase.User) => dispatch => {
    if (firebaseUser) { dispatch(fetchMemberByUidIfNeeded(firebaseUser.uid)); }
    dispatch(setFirebaseUser(firebaseUser));
  };
