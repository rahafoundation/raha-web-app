import * as firebase from 'firebase';
import { db } from './firebaseInit';
import store from './store';

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
