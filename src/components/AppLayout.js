import * as React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {
  lightGreen100,
  lightGreen300,
  lightGreen500,
  green500
} from 'material-ui/styles/colors';

import Link from './Link';
import Modal from './Modal';
import InviteInstructions from './InviteInstructions'
import { getAuthMemberDoc } from '../connectors';
import { showModal as showModalAction } from '../actions';

const FooterElem = styled.footer`
  padding: 20px;
  background: ${lightGreen100};
`;

function Footer() {
  return (
    <FooterElem>
      This is a footer!
    </FooterElem>
  );
}

const LogoElem = styled.span`
  color: white;
  font-size: 2em;
  font-weight: bold;
  padding: 10px;
`;

function Logo() {
  return <LogoElem>Raha</LogoElem>;
}

const HeaderElem = styled.header`
  display: flex;
  background: ${green500};
  align-items: center;
  justify-content: space-between;

  height: 50px;
  margin-bottom: 20px;
  border-bottom: 1px solid white;
  box-shadow: 0px 2px 2px #efefef;

  > .userSection {
    display: flex;
    align-items: center;

    height: 100%;

    *:not(:last-child) {
      margin-right: 10px;
    }

    > .loggedInUser {
      height: 100%;
      display: inline-flex;
      align-items: center;

      color: white;
      padding: 0 10px;
      background: ${lightGreen500};

      :hover, :focus, :active {
        background: ${lightGreen300};
        text-decoration: none;
      }
    }
  }
`;

function handleInviteClick(fullName, inviteUrl, showModal) {
  return () =>
    showModal(<InviteInstructions
      fullName={fullName}
      inviteUrl={inviteUrl}
    />);
}
function Header(props) {
  const { memberDetails, showModal } = props;
  const { fullName, inviteUrl } = memberDetails || {};

  return (
    <HeaderElem>
      <Logo />
      <span className="userSection">
        <button onClick={handleInviteClick(fullName, inviteUrl, showModal)}>
          Invite a new member
        </button>
        <Link className="loggedInUser" to="/me">{fullName}</Link>
      </span>
    </HeaderElem>
  );
}

const AppLayoutElem = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export function AppLayoutView(props) {
  const { authMemberDoc, showModal } = props;
  const headerProps = {
    memberDetails: authMemberDoc && {
      fullName: authMemberDoc.get('full_name'),
      inviteUrl: `${window.location.origin}/m/${authMemberDoc.get('mid')}/invite`
    },
    showModal
  };

  return (
    <AppLayoutElem id="appLayout">
      <Header {...headerProps} />
      <main>{props.children}</main>
      <Footer />
      <Modal />
    </AppLayoutElem>
  )
}


function mapStateToProps(state, ownProps) {
  const authIsLoaded = state.auth.isLoaded;
  const authFirebaseUser = state.auth.firebaseUser;
  const authMemberDoc = getAuthMemberDoc(state);  // TODO will we use this?

  return { authFirebaseUser, authMemberDoc, authIsLoaded };
}

function mapDispatchToProps(dispatch) {
  return {
    showModal: (element) => dispatch(showModalAction(element))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppLayoutView);