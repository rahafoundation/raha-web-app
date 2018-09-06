import * as firebase from "firebase";

export type MemberDoc = firebase.firestore.DocumentData;
export interface MemberEntry {
  readonly isFetching: boolean;
  // TODO: should this actually be optional?
  readonly memberDoc?: MemberDoc;
  readonly receivedAt: Date;
}
