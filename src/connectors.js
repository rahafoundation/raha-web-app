function getMemberDoc(member) {
  return member && member.memberDoc && member.memberDoc.exists ? member.memberDoc : null;
}

export function getAuthMemberDocIsLoaded(state) {
  if (!state.auth.isLoaded) return false;
  const authFirebaseUser = state.auth.firebaseUser;
  if (!authFirebaseUser) return true;
  const member = state.members.byUid[authFirebaseUser.uid];
  return member && !member.isFetching;
}

export function getAuthMemberDoc(state) {
  const authFirebaseUser = state.auth.firebaseUser;
  return authFirebaseUser ? getMemberDoc(state.members.byUid[authFirebaseUser.uid]) : null;
}

export function getMemberDocByUid(state, uid: string) {
  return getMemberDoc(state.members.byUid[uid]);
}

export function getMemberDocByMid(state, mid: string) {
  return getMemberDoc(state.members.byMid[mid]);
}
