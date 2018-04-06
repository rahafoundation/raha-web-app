import { Reducer } from 'redux';

import { MemberEntry } from '../members';

import {
  ReceiveMemberAction,
  RequestMemberByMidAction,
  RequestMemberByUidAction,
  RECEIVE_MEMBER,
  REQUEST_MEMBER_BY_MID,
  REQUEST_MEMBER_BY_UID,
} from "../actions";

export interface MembersState {
  readonly byMid: {[key: string]: MemberEntry},
  readonly byUid: {[key: string]: MemberEntry}
}

type MembersAction =
  ReceiveMemberAction |
  RequestMemberByMidAction |
  RequestMemberByUidAction;

const members: Reducer<MembersState> = (
  state = { byMid: {}, byUid: {} }, untypedAction
) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as MembersAction;
  switch (action.type) {
    case RECEIVE_MEMBER:
      {
        const isFetching = false;
        const { memberDoc, receivedAt, id, byMid } = action;
        const member = { isFetching, memberDoc, receivedAt };
        let mid: string | null = null;
        let uid: string | null = null;
        if (memberDoc) {
          uid = memberDoc.id;
          mid = memberDoc.get('mid');
        } else {
          if (byMid) {
            mid = id;
          } else {
            uid = id;
          }
        }
        const newMid = mid && {
          [mid]: member
        };
        const newUid = uid && {
          [uid]: member
        };
        return {
          byMid: {
            ...state.byMid,
            ...newMid
          },
          byUid: {
            ...state.byUid,
            ...newUid
          }
        };
      }
    case REQUEST_MEMBER_BY_MID:
      {
        const isFetching = true;
        const mid = action.mid;
        const newMid = {
          [mid]: { ...state.byMid[mid], ...{ isFetching, mid } }
        };
        return {
          byMid: {
            ...state.byMid,
            ...newMid
          },
          byUid: state.byUid
        };
      }
    case REQUEST_MEMBER_BY_UID:
      {
        const isFetching = true;
        const uid = action.uid;
        const newUid = {
          [uid]: { ...state.byUid[uid], ...{ isFetching, uid } }
        };
        return {
          byMid: state.byMid,
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

export default members;
