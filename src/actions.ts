import { Action } from 'redux';
import * as firebase from 'firebase';
import { db } from './firebaseInit';
import { Operation } from './operations'
import store from './store';

// member_actions.ts

export const RECEIVE_MEMBER = 'RECEIVE_MEMBER';
export const REQUEST_MEMBER = 'REQUEST_MEMBER';

function requestMember(uid: string) {
  return {
    type: REQUEST_MEMBER,
    value: {
      uid,
      isFetching: false
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

async function fetchMember(uid: string) {
  store.dispatch(requestMember(uid));
  const payload = await db.collection('members').doc(uid).get();
  store.dispatch(receiveMember(uid, payload));
}

export async function fetchOperations(query: firebase.firestore.Query) {
  let snap = await query.get();
  store.dispatch(receiveOperations(snap.docs));
}

function shouldFetchMember(uid: string) {
  const member = store.getState().uidToMembers[uid];
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

export async function fetchMemberIfNeeded(uid: string) {
  if (shouldFetchMember(uid)) {
    await fetchMember(uid);
  }
}

// op_actions.ts

export const RECEIVE_OPS = 'RECEIVE_OPS';
export const POST_OP = 'POST_OP';
export const ACKP_POST_OP = 'ACKP_POST_OP';

export enum OpActionTypes {
  ReceiveOps = '[Ops] ReceiveOps',
  PostOp = '[Ops] PostOp',
  AckPostOp = '[Ops] AckPostOp'
}

export class ReceiveOps implements Action {
  readonly type = OpActionTypes.ReceiveOps;

  constructor(public payload: Operation) {}
}

export class PostOp implements Action {
  readonly type = OpActionTypes.PostOp;

  constructor(public payload: { user: string }) {}
}

export class AckPostOp implements Action {
  readonly type = OpActionTypes.AckPostOp;

  constructor(public payload: any) {}
}


function postOp(uid: string, op: Operation) {
  return {
    type: REQUEST_MEMBER,
    value: {
      uid,
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

export async function postOperation(op: Operation) {
  let opDoc = db.collection('operations').doc();
  store.dispatch(new PostOp({user: "what what"}));
  try {
    // await opDoc.set(op);
    store.dispatch(new AckPostOp(opDoc.id));
  } catch {
    alert('Sorry could not post operation: ' + JSON.stringify(op)); // TODO show in UI
  }
}

function receiveOperations(opsDocs: Array<firebase.firestore.DocumentSnapshot>) {
  return {
    type: RECEIVE_OPS,
    ops: opsDocs.map(x => x.data())
  };
}

export type OpActions =
  | ReceiveOps
  | PostOp
  | AckPostOp;
