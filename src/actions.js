import * as firebase from 'firebase';
import { db } from './firebaseInit';
import { Operation } from './operations';

// member_actions.js

export const RECEIVE_MEMBER = 'RECEIVE_MEMBER';
export const REQUEST_MEMBER_BY_MID = 'REQUEST_MEMBER_BY_MID';
export const REQUEST_MEMBER_BY_UID = 'REQUEST_MEMBER_BY_UID';

function requestMemberByMid(mid: string) {
  return {
    type: REQUEST_MEMBER_BY_MID,
    mid,
  };
}

function requestMemberByUid(uid: string) {
  return {
    type: REQUEST_MEMBER_BY_UID,
    uid,
  };
}

function receiveMember(memberDoc: firebase.firestore.DocumentData, id: string, byMid: boolean) {
  return {
    type: RECEIVE_MEMBER,
    id,
    byMid,
    memberDoc,
    receivedAt: Date.now(),
  };
}

async function fetchMemberByMid(dispatch, mid: string) {
  dispatch(requestMemberByMid(mid));
  const memberQuery = await db.collection('members').where('mid', '==', mid).get();
  if (memberQuery.docs.length > 1) {
    alert(`Found multiple matching member ${mid}, please email bugs@raha.io`);
  }
  const memberDoc = memberQuery.docs.length === 1 ? memberQuery.docs[0] : null;
  dispatch(receiveMember(memberDoc, mid, true));
}

async function fetchMemberByUid(dispatch, uid: string) {
  dispatch(requestMemberByUid(uid));
  const memberDoc = await db.collection('members').doc(uid).get();
  // TODO error handling
  dispatch(receiveMember(memberDoc, uid, false));
}

function shouldFetchMember(member) {
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

function shouldFetchMemberByUid(getState, uid: string) {
  const member = getState().members.byUid[uid];
  return shouldFetchMember(member);
}

function shouldFetchMemberByMid(getState, mid: string) {
  const member = getState().members.byMid[mid];
  return shouldFetchMember(member);
}

export function fetchMemberByUidIfNeeded(uid: string) {
  return (dispatch, getState) => {
    if (shouldFetchMemberByUid(getState, uid)) {
      fetchMemberByUid(dispatch, uid);
    }
  }
}

export function fetchMemberByMidIfNeeded(mid: string) {
  return (dispatch, getState) => {
    if (shouldFetchMemberByMid(getState, mid)) {
      fetchMemberByMid(dispatch, mid);
    }
  }
}

// op_actions.js

export interface OpMeta {
  uid: string;
  inDb: boolean;
}

export const RECEIVE_OPS = 'RECEIVE_OPS';
export const POST_OP = 'POST_OP';
export const ACKP_POST_OP = 'ACKP_POST_OP';

function postOp(uid: string, op: Operation) {
  return {
    type: POST_OP,
    value: {
      uid,
      op,
      inDb: false
    }
  };
}

function ackPostOp(uid: string) {
  return {
    type: ACKP_POST_OP,
    value: {
      uid,
      inDb: true
    }
  }
}

export function postOperation(op: Operation) {
  return async dispatch => {
    let opDoc = db.collection('operations').doc();
    dispatch(postOp(opDoc.id, op));
    await opDoc.set(op);
    dispatch(ackPostOp(opDoc.id));
  }
}

function receiveOperations(opDocs: Array<firebase.firestore.DocumentSnapshot>) {
  return {
    type: RECEIVE_OPS,
    opDocs
  };
}

export function fetchOperations(query: firebase.firestore.Query) {
  return async dispatch => {
    let snap = await query.get();
    dispatch(receiveOperations(snap.docs));
  }
}

// auth_actions.js

export const SET_FIREBASE_USER = 'SET_FIREBASE_USER';

function setFirebaseUser(firebaseUser: firebase.User) {
  return {
    type: SET_FIREBASE_USER,
    firebaseUser
  }
}

export function authSetFirebaseUser(firebaseUser: firebase.User) {
  return dispatch => {
    if (firebaseUser) dispatch(fetchMemberByUidIfNeeded(firebaseUser.uid));
    dispatch(setFirebaseUser(firebaseUser));
  }
}