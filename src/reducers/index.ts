import { Action, combineReducers, Reducer } from 'redux';

// TODO: this stuff really should be split apart
import {
  ACKP_POST_OP,
  AckpPostOpAction,
  HIDE_MODAL,
  HideModalAction,
  POST_OP,
  PostOpAction,
  RECEIVE_MEMBER,
  RECEIVE_OPS,
  ReceiveMemberAction,
  ReceiveOpsAction,
  REQUEST_MEMBER_BY_MID,
  REQUEST_MEMBER_BY_UID,
  RequestMemberByMidAction,
  RequestMemberByUidAction,
  SET_FIREBASE_USER,
  SetFirebaseUserAction,
  SHOW_MODAL,
  ShowModalAction
} from '../actions';
import { MemberEntry } from '../members';
import {
  OpDoc,
  Operation,
  OpMeta,
} from '../operations';

interface MembersState {
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

interface OpMap { [id: string]: Operation }

/**
 * Helper function to parse operations and add them to
 * existing state.
 */
function parseOps(ops: OpMap, opDocs: OpDoc[]): OpMap {
  const newOps = opDocs.reduce(
    (res, d) => {
      res[d.id] = { uid: d.id, op: d.data(), inDb: true };
      return res;
    },
    {} as OpMap
  );
  return { ...ops, ...newOps };
}

type UidToOpMetaAction = ReceiveOpsAction | PostOpAction | AckpPostOpAction;
type UidToOpMetaState = OpMap;

const uidToOpMeta: Reducer<UidToOpMetaState> = (
  state = {}, untypedAction
) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as UidToOpMetaAction;

  switch (action.type) {
    case RECEIVE_OPS:
      return parseOps(state, action.opDocs);
    case POST_OP:
    case ACKP_POST_OP:
      const { uid, ...value } = action.value;
      const updatedOp = { [uid]: { ...state[uid], ...value } };
      return { ...state, ...updatedOp };
    default:
      return state;
  }
};

type OperationsAction = ReceiveOpsAction;
export type OperationsState = OpMap;

/**
 * This is a simple container for received operations.
 */
const operations: Reducer<OpMap> = (state = {}, untypedAction) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as OperationsAction;
  switch (action.type) {
    case RECEIVE_OPS:
      return parseOps(state, action.opDocs);
    default:
      return state;
  }
};

interface AuthState {
  isLoaded: boolean,
  firebaseUser: firebase.User | null;
}

type AuthAction = SetFirebaseUserAction;

const auth: Reducer<AuthState> = (
  state = { firebaseUser: null, isLoaded: false }, untypedAction
) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as AuthAction;
  switch (action.type) {
    case SET_FIREBASE_USER:
      return { isLoaded: true, firebaseUser: action.firebaseUser };
    default:
      return state;
  }
};

interface ModalState {
  element: React.ReactNode | null;
}
type ModalAction = HideModalAction | ShowModalAction;

const modal: Reducer<ModalState> = (
  state = { element: null }, untypedAction
) => {
  // TODO: this is a hack for now until Redux 4's typing comes out, or we use
  // a flux standard actions library to handle typings; this gives stronger
  // type checking.
  const action = untypedAction as ModalAction;
  switch (action.type) {
    case HIDE_MODAL:
      return { ...state, element: null };
    case SHOW_MODAL:
      return { ...state, element: action.element };
    default:
      return state;
  }
};

export interface AppState {
  members: MembersState;
  uidToOpMeta: UidToOpMetaState;
  auth: AuthState;
  operations: OperationsState;
  modal: ModalState;
}
const rootReducer = combineReducers({
  members,
  uidToOpMeta,
  auth,
  operations,
  modal
});

export default rootReducer;
