import { Reducer } from "redux";

import {
  SET_FIREBASE_USER,
  SetFirebaseUserAction,
} from '../actions';

export interface AuthState {
  isLoaded: boolean,
  firebaseUser: firebase.User | null;
}
type AuthAction = SetFirebaseUserAction;

const auth: Reducer<AuthState> = (
  state = { firebaseUser: null, isLoaded: false }, untypedAction
) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as AuthAction;
  switch (action.type) {
    case SET_FIREBASE_USER:
      return { isLoaded: true, firebaseUser: action.firebaseUser };
    default:
      return state;
  }
};
export default auth;
