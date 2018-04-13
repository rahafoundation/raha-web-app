import { AppState } from "../store";
import { Uid } from "../identifiers";
import { Member } from "../reducers/membersNew";

// TODO: make this a selector on the state, not inline in this container
export function getMembersByUid(state: AppState, uids: Uid[]): Member[] {
  return uids.map(uid => state.membersNew.byUid[uid]);
}
