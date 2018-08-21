// TODO: nuke this reducer, replace with membersNew
import { Reducer } from "redux";

import { MemberEntry } from "../members";

import {
  ReceiveMemberAction,
  RequestMemberByMidAction,
  RequestMemberByUidAction,
  RECEIVE_MEMBER,
  REQUEST_MEMBER_BY_MID,
  REQUEST_MEMBER_BY_UID
} from "../actions";

export interface MembersState {
  readonly byUsername: { [key: string]: MemberEntry };
  readonly byUid: { [key: string]: MemberEntry };
}

type MembersAction =
  | ReceiveMemberAction
  | RequestMemberByMidAction
  | RequestMemberByUidAction;

const members: Reducer<MembersState> = (
  state = { byUsername: {}, byUid: {} },
  untypedAction
) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as MembersAction;
  switch (action.type) {
    case RECEIVE_MEMBER: {
      const isFetching = false;
      const { memberDoc, receivedAt, id, byUsername } = action;
      const member = { isFetching, memberDoc, receivedAt };
      let username: string | null = null;
      let uid: string | null = null;
      if (memberDoc) {
        uid = memberDoc.id;
        username = memberDoc.get("username");
      } else {
        if (byUsername) {
          username = id;
        } else {
          uid = id;
        }
      }
      const newMid = username && {
        [username]: member
      };
      const newUid = uid && {
        [uid]: member
      };
      return {
        byUsername: {
          ...state.byUsername,
          ...newMid
        },
        byUid: {
          ...state.byUid,
          ...newUid
        }
      };
    }
    case REQUEST_MEMBER_BY_MID: {
      const isFetching = true;
      const username = action.username;
      const newMid = {
        [username]: {
          ...state.byUsername[username],
          ...{ isFetching, username }
        }
      };
      return {
        byUsername: {
          ...state.byUsername,
          ...newMid
        },
        byUid: state.byUid
      };
    }
    case REQUEST_MEMBER_BY_UID: {
      const isFetching = true;
      const uid = action.uid;
      const newUid = {
        [uid]: { ...state.byUid[uid], ...{ isFetching, uid } }
      };
      return {
        byUsername: state.byUsername,
        byUid: {
          ...state.byUid,
          ...newUid
        }
      };
    }
    default:
      return state;
  }
};

export { members };
