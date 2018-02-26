import { combineReducers } from 'redux';

import { RECEIVE_MEMBER, REQUEST_MEMBER, RECEIVE_OPS, POST_OP, ACKP_POST_OP, SET_FIREBASE_USER } from './actions';

function uidToMembers(state = {}, action) {
  switch (action.type) {
    case RECEIVE_MEMBER:
    case REQUEST_MEMBER:
      const { uid, ...value } = action.value;
      return {
        ...state,
        [uid]: value
      };
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
  uidToMembers,
  uidToOpMeta,
  auth
});

export default rootReducer;
