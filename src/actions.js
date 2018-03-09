import * as firebase from 'firebase';
import { db } from './firebaseInit';
import { Operation } from './operations';

// member_actions.js

export const RECEIVE_MEMBER = 'RECEIVE_MEMBER';
export const REQUEST_MEMBER = 'REQUEST_MEMBER';

function requestMember(uid: string) {
  return {
    type: REQUEST_MEMBER,
    value: {
      uid,
      isFetching: true
    }
  };
}

function receiveMember(uid: string, doc: firebase.firestore.DocumentData) {
  return {
    type: RECEIVE_MEMBER,
    value: {
      doc,
      isFetching: false,
      receivedAt: Date.now(),
      uid
    }
  };
}

async function fetchMemberByUid(dispatch, uid: string) {
  dispatch(requestMember(uid));
  const payload = await db.collection('members').doc(uid).get();
  dispatch(receiveMember(uid, payload));
}

async function fetchMemberByMid(dispatch, mid: string) {
  // dispatch(requestMemberByMid(uid));
  const memberQuery = await db.collection('members').where('mid', '==', mid).get();
  // TODO error handling
  const member = memberQuery.docs[0];
  dispatch(receiveMember(member.id, member));
}

function shouldFetchMemberByUid(getState, uid: string) {
  const member = getState().uidToMembers[uid];
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

function shouldFetchMemberByMid(getState, mid: string) {
  const memberUid = getState().midToUid[mid];  // TODO add to reducers.js
  return !memberUid || !memberUid.isFetching;
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
    if (shouldFetchMemberByMid(getState, mid)) {  // TODO implement
      fetchMemberByMid(dispatch, mid); // TODO implement
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