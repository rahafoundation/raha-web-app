import { combineReducers } from 'redux';

import { RECEIVE_MEMBER, REQUEST_MEMBER_BY_MID, REQUEST_MEMBER_BY_UID, RECEIVE_OPS, POST_OP, ACKP_POST_OP, SET_FIREBASE_USER } from './actions';

function members(state = { byMid: {}, byUid: {} }, action) {
  switch (action.type) {
    case RECEIVE_MEMBER:
      {
        const isFetching = false;
        const { memberDoc, receivedAt, id, byMid } = action;
        const member = { isFetching, memberDoc, receivedAt };
        let mid = null;
        let uid = null;
        if (memberDoc) {
          uid = memberDoc.id;
          mid = memberDoc.get('mid');
        } else {
          if (byMid) {
            mid = id;
          } else {
            uid = id;
          }
        }
        const newMid = mid && {
          [mid]: member
        };
        const newUid = uid && {
          [uid]: member
        };
        return {
          byMid: {
            ...state.byMid,
            ...newMid
          },
          byUid: {
            ...state.byUid,
            ...newUid
          }
        };
      }
    case REQUEST_MEMBER_BY_MID:
      {
        const isFetching = true;
        const mid = action.mid;
        const newMid = {
          [mid]: { ...state.byMid[mid], ...{ isFetching, mid } }
        };
        return {
          byMid: {
            ...state.byMid,
            ...newMid
          },
          byUid: state.byUid
        };
      }
    case REQUEST_MEMBER_BY_UID:
      {
        const isFetching = true;
        const uid = action.uid;
        const newUid = {
          [uid]: { ...state.byUid[uid], ...{ isFetching, uid } }
        };
        return {
          byMid: state.byMid,
          byUid: {
            ...state.byUid,
            ...newUid
          }
        };
      }
    default:
      return state;
  }
}

function uidToOpMeta(state = {}, action) {
  switch (action.type) {
    case RECEIVE_OPS:
      const newOps = action.opDocs.reduce((res, d) => {
        res[d.id] = { uid: d.id, op: d.data(), inDb: true };
        return res;
      }, {});
      return { ...state, ...newOps };
    case POST_OP:
    case ACKP_POST_OP:
      const { uid, ...value } = action.value;
      const updatedOp = { [uid]: { ...state[uid], ...value } };
      return { ...state, ...updatedOp };
    default:
      return state;
  }
}

function auth(state = { firebaseUser: null, isLoaded: false }, action) {
  switch (action.type) {
    case SET_FIREBASE_USER:
      return { isLoaded: true, firebaseUser: action.firebaseUser };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  members,
  uidToOpMeta,
  auth
});

export default rootReducer;
