import { Reducer } from "redux";

import { SET_FIREBASE_USER, SetFirebaseUserAction } from "../actions";

export interface AuthState {
  firebaseUser?: firebase.User;
}
type AuthAction = SetFirebaseUserAction;

const auth: Reducer<AuthState> = (state = {}, untypedAction) => {
  const action = untypedAction as AuthAction;
  switch (action.type) {
    case SET_FIREBASE_USER:
      return { firebaseUser: action.firebaseUser };
    default:
      return state;
  }
};
export default auth;
