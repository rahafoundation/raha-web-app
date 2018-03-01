export function getAuthMemberData(state) {
  let authMemberData = null;
  const authFirebaseUser = state.auth.firebaseUser;
  if (authFirebaseUser) {
    const member = state.uidToMembers[authFirebaseUser.uid];
    if (member.doc) {
      authMemberData = member.doc;
    }
  }
  return authMemberData;
}
