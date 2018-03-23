import * as React from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-free-solid';
import styled from 'styled-components';

import { hideModal } from '../actions';

// necessary as per react-modal docs for accessibility
ReactModal.setAppElement('#root');

const CloseButton = styled.button`
  position: absolute;
  right: 5px;
  top: 5px;
  background: none;
  border: 0;
  font-size: 1.3rem;
  color: gray;
  cursor: pointer;

  :hover, :focus, :active {
    color: lightgray;
  }
`;

const customModalContentStyle = {
  position: 'fixed',
  top: '50%',
  right: 'auto',
  bottom: 'auto',
  left: '50%',
  transform: 'translate(-50%,-50%)',
  outline: 0
};

export function Modal(props) {
  const { hideModal, modalElem } = props;

  return (
    <ReactModal
      isOpen={!!modalElem}
      onRequestClose={ hideModal }
      style={{content: customModalContentStyle}}
    >
      <div>
        <CloseButton onClick={hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        { modalElem }
      </div>
    </ReactModal>
  );
}

function mapStateToProps(state) {
  return {
    modalElem: state.modal.element
  };
}

function mapDispatchToProps(dispatch) {
  return {
    hideModal: () => dispatch(hideModal())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
