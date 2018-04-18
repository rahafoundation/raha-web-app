import { AppState } from "../store";
import { Uid } from "../identifiers";
import { Member } from "../reducers/membersNew";

export function getMembersByUid(
  state: AppState,
  uids: Uid[]
): Array<Member | undefined> {
  return uids.map(uid => state.membersNew.byUid[uid]);
}

export function getMembersByMid(
  state: AppState,
  mids: Uid[]
): Array<Member | undefined> {
  return mids.map(mid => state.membersNew.byMid[mid]);
}
