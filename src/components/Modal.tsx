import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import * as ReactModal from "react-modal";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import styled from "styled-components";

import { hideModal as hideModalAction } from "../actions";
import { AppState } from "../store";

// necessary as per react-modal docs for accessibility
if (document.getElementById("root")) {
  ReactModal.setAppElement("#root");
}

const CloseButton = styled.button`
  position: absolute;
  right: 5px;
  top: 5px;
  background: none;
  border: 0;
  font-size: 1.3rem;
  color: gray;
  cursor: pointer;

  :hover,
  :focus,
  :active {
    color: lightgray;
  }
`;

const customModalContentStyle = {
  position: "fixed",
  top: "50%",
  right: "auto",
  bottom: "auto",
  left: "50%",
  transform: "translate(-50%,-50%)",
  outline: 0,
  maxWidth: "80vw"
};

interface StateProps {
  modalElem: React.ReactNode;
}
interface DispatchProps {
  hideModal: () => void;
}
interface OwnProps {}
type Props = OwnProps & StateProps & DispatchProps;

export const Modal: React.StatelessComponent<Props> = props => {
  const { hideModal, modalElem } = props;

  return (
    <ReactModal
      isOpen={!!modalElem}
      onRequestClose={hideModal}
      style={{ content: customModalContentStyle }}
    >
      <div>
        <CloseButton onClick={hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        {modalElem}
      </div>
    </ReactModal>
  );
};

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  AppState
> = state => {
  return {
    modalElem: state.modal.element
  };
};

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  OwnProps
> = dispatch => {
  return {
    hideModal: () => dispatch(hideModalAction())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Modal);
