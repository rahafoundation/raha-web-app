import { faUserPlus } from "@fortawesome/fontawesome-free-solid";
import * as FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {
  green300,
  green500,
  green700,
  grey200,
  lightGreen300,
  lightGreen500
} from "material-ui/styles/colors";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import styled from "styled-components";

import { showModal as showModalAction } from "../actions";
import { getAuthMemberDoc, getAuthMemberDocIsLoaded } from "../connectors";
import { MemberDoc } from "../members";
import { AppState } from "../store";

import InviteInstructions from "./InviteInstructions";

import Link from "../components/Link";
import LogoIcon from "../components/LogoIcon";
import Modal from "../components/Modal";

const NARROW_WIDTH_SCREEN = "420px";

const FooterElem = styled.footer`
  padding: 50px 30px;
  margin-top: 50px;
  background: ${grey200};
  text-align: center;
`;

const Footer: React.StatelessComponent<{}> = () => {
  return <FooterElem>Raha Foundation, 2018</FooterElem>;
};

const LogoElem = styled.span`
  display: flex;
  align-items: center;
  color: white;
  font-size: 2em;
  font-weight: bold;
  padding: 10px;
  @media (max-width: ${NARROW_WIDTH_SCREEN}) {
    .logoText {
      display: none;
    }
  }
`;

const LogoImg = styled(LogoIcon)`
  margin-right: 20px;
`;

function Logo() {
  return (
    <LogoElem>
      <LogoImg />
      <span className="logoText">Raha</span>
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

  a {
    text-decoration: none;
  }

  > .userSection {
    display: flex;
    align-items: center;

    height: 100%;

    > .inviteButton {
      height: 100%;
      padding: 0 20px;
      background: ${green700};
      cursor: pointer;
      transition: background 0.1s;

      > .icon {
        margin-right: 8px;
      }

      :hover,
      :active,
      :focus {
        background: ${green300};
      }

      border: none;
      color: white;
      font-size: 1rem;

      @media (max-width: ${NARROW_WIDTH_SCREEN}) {
        .icon {
          margin-right: 0;
        }
        .inviteButtonText {
          display: none;
        }
      }
    }

    > .loggedInUser,
    .logIn {
      height: 100%;
      display: inline-flex;
      align-items: center;
      max-width: 120px;

      color: white;
      padding: 0 10px;
      background: ${lightGreen500};
      transition: background-color 0.1s;

      :hover,
      :focus,
      :active {
        background: ${lightGreen300};
        text-decoration: none;
      }
    }
  }
`;

function handleInviteClick(
  fullName: string,
  inviteUrl: string,
  showModal: (elem: React.ReactNode) => void
) {
  return () =>
    showModal(<InviteInstructions fullName={fullName} inviteUrl={inviteUrl} />);
}

interface MemberDetails {
  fullName: string | null;
  inviteUrl?: string;
  profileUrl?: string;
}
interface HeaderProps {
  memberDetails?: MemberDetails;
  showModal: (elem: React.ReactNode) => void;
}
const Header: React.StatelessComponent<HeaderProps> = props => {
  const { memberDetails, showModal } = props;

  return (
    <HeaderElem>
      <a href="/">
        <Logo />
      </a>
      {memberDetails && (
        <span className="userSection">
          {memberDetails.inviteUrl && (
            <button
              className="inviteButton"
              onClick={handleInviteClick(
                memberDetails.fullName || "",
                memberDetails.inviteUrl,
                showModal
              )}
            >
              <FontAwesomeIcon className="icon" icon={faUserPlus} />
              <span className="inviteButtonText">Invite</span>
            </button>
          )}
          {memberDetails.profileUrl && (
            <Link className="loggedInUser" to={memberDetails.profileUrl}>
              {memberDetails.fullName}
            </Link>
          )}
          {!memberDetails.profileUrl && (
            <Link className="logIn" to="/login">
              <FormattedMessage id="app_layout.log_in" />
            </Link>
          )}
        </span>
      )}
    </HeaderElem>
  );
};

const AppLayoutElem = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  > .spacer {
    flex-grow: 1;
  }
`;

interface OwnProps {}
interface StateProps {
  authFirebaseUser?: firebase.User;
  authMemberDoc: MemberDoc;
  authMemberDocIsLoaded: boolean;
}
interface DispatchProps {
  showModal: (elem: React.ReactNode) => void;
}
type Props = OwnProps & StateProps & DispatchProps;

export const AppLayoutView: React.StatelessComponent<Props> = props => {
  const {
    authFirebaseUser,
    authMemberDoc,
    authMemberDocIsLoaded,
    showModal
  } = props;
  let memberDetails: MemberDetails | undefined; // TODO do not overload memberDetails with multiple types
  if (authMemberDoc) {
    // TODO if invite missing
    const profileUrl = `/m/${authMemberDoc.get("mid")}`;
    memberDetails = {
      fullName: authMemberDoc.get("full_name"),
      inviteUrl: `${window.location.origin}${profileUrl}/invite`,
      profileUrl
    };
  } else if (authMemberDocIsLoaded && authFirebaseUser) {
    memberDetails = {
      fullName: authFirebaseUser.displayName,
      profileUrl: "/invite_missing"
    };
  }
  const headerProps = { memberDetails, showModal };
  return (
    <AppLayoutElem id="appLayout">
      <Header {...headerProps} />
      <main>{props.children}</main>
      <div className="spacer" />
      <Footer />
      <Modal />
    </AppLayoutElem>
  );
};

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  AppState
> = state => {
  const authFirebaseUser = state.auth.firebaseUser;
  const authIsLoaded = !!authFirebaseUser;
  const authMemberDoc = getAuthMemberDoc(state);
  const authMemberDocIsLoaded = getAuthMemberDocIsLoaded(state);
  return {
    authFirebaseUser,
    authMemberDoc,
    authMemberDocIsLoaded,
    authIsLoaded
  };
};

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  OwnProps
> = dispatch => {
  return {
    showModal: (element: React.ReactNode) => {
      dispatch(showModalAction(element));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppLayoutView);
