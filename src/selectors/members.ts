import { AppState } from "../store";
import { Uid } from "../identifiers";
import { Member } from "../reducers/membersNew";

export function getMembersByUid(state: AppState, uids: Uid[]): Member[] {
  return uids.map(uid => state.membersNew.byUid[uid]);
}
