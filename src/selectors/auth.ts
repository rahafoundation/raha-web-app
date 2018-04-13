import { AppState } from "../store";

export async function getAuthToken(
  getState: () => AppState
): Promise<string | undefined> {
  const authFirebaseUser = getState().auth.firebaseUser;
  if (!authFirebaseUser) {
    // TODO: trigger login or error
    return;
  }
  const authToken = await authFirebaseUser.getIdToken();
  return authToken;
}
