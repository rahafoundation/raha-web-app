import { MemberDoc } from './members';
import { AppState } from './store';

export function getMemberDoc(member: MemberDoc) {
  return member && member.memberDoc && member.memberDoc.exists ? member.memberDoc : null;
}

export function getAuthMemberDocIsLoaded(state: AppState) {
  if (!state.auth.isLoaded) { return false; }
  const authFirebaseUser = state.auth.firebaseUser;
  if (!authFirebaseUser) { return true; }
  const member = state.members.byUid[authFirebaseUser.uid];
  return member && !member.isFetching;
}

export function getAuthMemberDoc(state: AppState) {
  const authFirebaseUser = state.auth.firebaseUser;
  return authFirebaseUser ? getMemberDoc(state.members.byUid[authFirebaseUser.uid]) : null;
}

export function getMemberDocByUid(state: AppState, uid: string) {
  return getMemberDoc(state.members.byUid[uid]);
}

export function getMemberDocByMid(state: AppState, mid: string) {
  return getMemberDoc(state.members.byMid[mid]);
}
