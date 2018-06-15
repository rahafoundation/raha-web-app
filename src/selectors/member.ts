import { Big } from "big.js";

import { AppState } from "../store";
import { Uid } from "../identifiers";

const RAHA_UBI_WEEKLY_RATE = 10;
const MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

export function getMemberMintableAmount(
  state: AppState,
  uid: Uid
): string | undefined {
  const member = state.membersNew.byUid[uid];
  if (member) {
    return new Big(new Date().getTime() - member.lastMinted.getTime())
      .div(MILLISECONDS_PER_WEEK)
      .times(RAHA_UBI_WEEKLY_RATE)
      .round(2, 0)
      .toString();
  }
  return undefined;
}
