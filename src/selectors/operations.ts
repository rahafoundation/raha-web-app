import { Operation } from "@raha.app/api-server/dist/models/Operation";

import { Uid } from "../identifiers";
import { AppState } from "../store";

export function getMemberOperations(state: AppState, uid: Uid): Operation[] {
  return state.operations.filter(op => {
    return (
      op.creator_uid === uid || ("to_uid" in op.data && op.data.to_uid === uid)
    );
  });
}
