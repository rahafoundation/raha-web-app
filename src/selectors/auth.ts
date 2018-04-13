import { AppState } from "../store";

export async function getAuthToken(
  state: AppState
): Promise<string | undefined> {
  const authFirebaseUser = state.auth.firebaseUser;
  if (!authFirebaseUser) {
    // TODO: trigger login or error
    return;
  }
  const authToken = await authFirebaseUser.getIdToken();
  return authToken;
}

// TODO: make this a selector on the state, not inline in this container
export function getLoggedInMember(state: AppState) {
  const loggedInFirebaseUid =
    state.auth.firebaseUser !== null ? state.auth.firebaseUser.uid : undefined;
  return loggedInFirebaseUid
    ? state.membersNew.byUid[loggedInFirebaseUid]
    : undefined;
}
