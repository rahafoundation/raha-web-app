import * as React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {
  lightGreen300,
  lightGreen500,
  green300,
  green500,
  grey200
} from 'material-ui/styles/colors';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/fontawesome-free-solid';
import { FormattedMessage } from 'react-intl';

import Link from './Link';
import Modal from './Modal';
import InviteInstructions from './InviteInstructions'
import { getAuthMemberDocIsLoaded, getAuthMemberDoc } from '../connectors';
import { showModal as showModalAction } from '../actions';
import LogoIcon from './LogoIcon';

const FooterElem = styled.footer`
  padding: 50px 30px;
  margin-top: 50px;
  background: ${grey200};
  text-align: center;
`;

function Footer() {
  return (
    <FooterElem>
      Raha Foundation, 2018
    </FooterElem>
  );
}

const LogoElem = styled.span`
  display: flex;
  align-items: center;
  color: white;
  font-size: 2em;
  font-weight: bold;
  padding: 10px;
`;

const LogoImg = styled(LogoIcon)`
  margin-right: 20px;
`;

function Logo() {
  return (
  <LogoElem>
    <LogoImg />
    Raha
  </LogoElem>
  );
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

    > .inviteButton {
      height: 100%;
      padding: 0 20px;
      cursor: pointer;
      transition: background .1s;

      > .icon {
        margin-right: 8px;
      }

      :hover, :active, :focus {
        background: ${green300};
      }

      border: none;
      background: none;
      color: white;
      font-size: 1rem;
    }

    > .loggedInUser, .logIn {
      height: 100%;
      display: inline-flex;
      align-items: center;

      color: white;
      padding: 0 10px;
      background: ${lightGreen500};
      transition: background-color .1s;

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
  const { fullName, inviteUrl, profileUrl } = memberDetails || {};

  return (
    <HeaderElem>
      <Logo />
      <span className="userSection">
        {
          [
            inviteUrl &&
                <button
                  key="inviteButton"
                  className="inviteButton"
                  onClick={handleInviteClick(fullName, inviteUrl, showModal)}
                >
                  <FontAwesomeIcon className="icon" icon={faUserPlus} />
                  Invite
                </button>,
            profileUrl && <Link key="profile" className="loggedInUser" to={profileUrl}>{fullName}</Link>,
            !profileUrl && <Link key="login" className="logIn" to="/login"><FormattedMessage id="app_layout.log_in" /></Link>
          ]
        }
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
  const { authFirebaseUser, authMemberDoc, authMemberDocIsLoaded, showModal } = props;
  let memberDetails = false;
  if (authMemberDoc) {  // TODO if invite missing
    const profileUrl = `/m/${authMemberDoc.get('mid')}`;
    memberDetails = {
      fullName: authMemberDoc.get('full_name'),
      inviteUrl: `${window.location.origin}${profileUrl}/invite`,
      profileUrl
    };
  } else if (authMemberDocIsLoaded && authFirebaseUser) {
    memberDetails = {
      fullName: authFirebaseUser.displayName,
      profileUrl: '/invite_missing'
    };
  }
  const headerProps = { memberDetails, showModal };
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
  const authMemberDoc = getAuthMemberDoc(state);
  const authMemberDocIsLoaded = getAuthMemberDocIsLoaded(state);
  return { authFirebaseUser, authMemberDoc, authMemberDocIsLoaded, authIsLoaded };
}

function mapDispatchToProps(dispatch) {
  return {
    showModal: (element) => dispatch(showModalAction(element))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppLayoutView);