import * as firebase from "firebase";

import { MemberDoc } from "./members";
import { AppState } from "./store";

export function getMemberDoc(member: MemberDoc) {
  return member && member.memberDoc && member.memberDoc.exists
    ? member.memberDoc
    : null;
}

/**
 * Returns true if:
 * a) the Firebase user has been retrieved;
 * b) the associated member metadata for that Firebase user from the API has
 * been loaded
 */
export function getAuthMemberDocIsLoaded(state: AppState) {
  if (!state.auth.isLoaded) {
    return false;
  }
  const authFirebaseUser = state.auth.firebaseUser;
  // Auth was loaded but no user exists—not logged in, so no member doc
  // to load, meaning it has been loaded
  if (!authFirebaseUser) {
    return true;
  }
  // otherwise do fetch the doc
  const member = state.members.byUid[authFirebaseUser.uid];
  return member && !member.isFetching;
}

export function getAuthMemberDoc(state: AppState) {
  const authFirebaseUser = state.auth.firebaseUser;
  return authFirebaseUser
    ? getMemberDoc(state.members.byUid[authFirebaseUser.uid])
    : null;
}

export function getPrivateVideoInviteRef(
  storageRef: firebase.storage.Reference,
  userId: string
) {
  return storageRef
    .child("private-video")
    .child(userId)
    .child("invite.mp4");
}

export function getMemberDocByUid(state: AppState, uid: string) {
  return getMemberDoc(state.members.byUid[uid]);
}

export function getMemberDocByMid(state: AppState, username: string) {
  return getMemberDoc(state.members.byUsername[username]);
}
