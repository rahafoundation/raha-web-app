import { combineReducers } from 'redux';
import { RECEIVE_MEMBER, REQUEST_MEMBER } from './actions';

interface MemberAction {
  type: string;
  value: {
    uid: string
  };
}

// tslint:disable-next-line:no-any
type MembersState = Map<string, any>;

function uidToMembers(state: MembersState = {} as MembersState, action: MemberAction) {
  switch (action.type) {
    case RECEIVE_MEMBER:
    case REQUEST_MEMBER:
      const {uid, ...value} = action.value;
      return {
        ...state,
        [uid]: value
      };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  uidToMembers
});
 
export default rootReducer;
