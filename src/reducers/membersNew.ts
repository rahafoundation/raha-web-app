import { Reducer } from 'redux';

import { Uid, Mid } from '../identifiers'
import { MembersAction, MembersActionType } from '../actions';
/**
 * Members that we're in the process of building up from operations below.
 */
export class Member {
  public uid: Uid;
  public mid: Mid;
  public fullName: string | undefined;
  public trusts: {[key: string]: boolean} = {};
  public trustedBy: {[key: string]: boolean} = {};
  public invited: {[key: string]: boolean} = {};
  public invitedBy: Uid | undefined;

  constructor(uid: Uid, mid: Mid) {
      this.uid = uid;
      this.mid = mid;
  }
}

export interface MemberLookupTable {
  // NOTE: it's a Uid, but for some reason typescript doesn't allow aliases here
  [key: string]: Member
}

export type MembersState = MemberLookupTable

export const reducer: Reducer<MembersState> = (
  state = {}, untypedAction
) => {
  const action = untypedAction as MembersAction;
  switch(action.type) {
    case (MembersActionType.SET_MEMBERS): {
      // TODO: maybe use immutable js for this?
      return action.members;
    }
    default:
      return state;
  }
}
