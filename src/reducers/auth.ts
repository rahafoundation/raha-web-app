import { Reducer } from "redux";

import { SET_FIREBASE_USER, SetFirebaseUserAction } from "../actions";

export interface AuthState {
  firebaseUser?: firebase.User;
  isLoaded: boolean;
}
type AuthAction = SetFirebaseUserAction;

const initialState: AuthState = {
  isLoaded: false
};
const auth: Reducer<AuthState> = (state = initialState, untypedAction) => {
  const action = untypedAction as AuthAction;
  switch (action.type) {
    case SET_FIREBASE_USER:
      return { isLoaded: true, firebaseUser: action.firebaseUser };
    default:
      return state;
  }
};
export default auth;
