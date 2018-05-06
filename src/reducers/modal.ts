import { Reducer } from "redux";

import {
  HIDE_MODAL,
  HideModalAction,
  SHOW_MODAL,
  ShowModalAction
} from "../actions";

export interface ModalState {
  element: React.ReactNode | null;
}
type ModalAction = HideModalAction | ShowModalAction;

const modal: Reducer<ModalState> = (
  state = { element: null },
  untypedAction
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

export default modal;
