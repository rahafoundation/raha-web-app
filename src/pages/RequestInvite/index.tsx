import * as React from "react";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import styled from "styled-components";
import * as path from "path";
import { push as pushRouteAction } from "react-router-redux";

import { requestInviteFromMember as requestInviteFromMemberAction } from "../../actions";
import { getPrivateVideoInviteRef } from "../../connectors";
import { Member } from "../../reducers/membersNew";
import { storageRef } from "../../firebaseInit";
import { AppState } from "../../store";

import Loading from "../../components/Loading";
import IntlMessage from "../../components/IntlMessage";
import { Redirect } from "react-router-dom";
import { blueGrey300 } from "material-ui/styles/colors";
import { getStatusOfApiCall } from "../../selectors/apiCalls";
import { ApiCallStatusType, ApiCallStatus } from "../../reducers/apiCalls";
import { ApiEndpoint } from "../../api";
import { getMembersByMid } from "../../selectors/members";

import WelcomeSteps from "./WelcomeSteps";

const RequestInviteElem = styled.main`
  > header {
    text-align: center;

    > .ownInvitePage {
      display: inline-block;
      background: ${blueGrey300};
      color: white;
      max-width: 80vw;
      text-align: center;
      padding: 10px 20px;
      margin-bottom: 20px;
    }
  }
`;

// TODO: could be more but this is a really confusing component
// TODO: this seems to be duplicated in multiple places
interface OwnProps {
  match: { params: { memberId: string } };
}

interface StateProps {
  isFirebaseUserLoaded: boolean;
  loggedInFirebaseUser?: firebase.User;
  requestingFromMember?: Member;
  isOwnInvitePage: boolean;
  requestInviteStatus?: ApiCallStatus;
  currentStep: number;
}

export type RequestInviteFn = (
  fullName: string,
  videoUrl: string,
  creatorMid: string
) => void;

type MergedProps = StateProps &
  OwnProps & {
    requestInvite?: RequestInviteFn;
    pushRoute: (url: string) => void;
  };

interface DispatchProps {
  requestInviteFromMember: any;
  pushRoute: any;
}

export type Props = OwnProps & MergedProps;

export class RequestInvite extends React.Component<Props> {
  public render() {
    const {
      isFirebaseUserLoaded,
      requestingFromMember,
      loggedInFirebaseUser,
      requestInvite,
      requestInviteStatus
    } = this.props;
    if (!(isFirebaseUserLoaded && requestingFromMember && requestInvite)) {
      return <Loading />;
    }

    // TODO check if user already requested invite
    if (
      requestInviteStatus &&
      requestInviteStatus.status === ApiCallStatusType.SUCCESS
    ) {
      const profileUrl = `${window.location.origin}`;
      return <Redirect to={profileUrl} />;
    }

    const loggedInUserProp =
      loggedInFirebaseUser && storageRef
        ? {
            firebaseUser: loggedInFirebaseUser,
            videoUploadRef:
              storageRef &&
              getPrivateVideoInviteRef(storageRef, loggedInFirebaseUser.uid)
          }
        : undefined;

    return (
      <RequestInviteElem>
        {this.props.isOwnInvitePage && (
          <header>
            <IntlMessage id="own_invite_page" className="ownInvitePage" />
          </header>
        )}
        <WelcomeSteps
          currentStep={this.props.currentStep}
          inviterName={requestingFromMember.fullName}
          loggedInUser={loggedInUserProp}
          requestInvite={requestInvite}
          navigateToStep={(stepNum: number) => {
            this.props.pushRoute(`#${stepNum}`);
          }}
        />
      </RequestInviteElem>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state: AppState,
  ownProps: OwnProps
) => {
  const curRoute = state.router.location;
  const urlStepNum =
    curRoute && curRoute.hash.length > 0
      ? parseInt(curRoute.hash.slice(1), 10)
      : NaN;
  const currentStep = isNaN(urlStepNum) ? 0 : urlStepNum;
  const isFirebaseUserLoaded = state.auth.isLoaded;
  const loggedInFirebaseUser = state.auth.firebaseUser;
  const requestingFromMid = ownProps.match.params.memberId;
  const fetchedRequestingFromMember = getMembersByMid(state, [
    requestingFromMid
  ]);
  const requestingFromMember =
    fetchedRequestingFromMember.length > 0
      ? fetchedRequestingFromMember[0]
      : undefined;

  const isOwnInvitePage =
    !!loggedInFirebaseUser &&
    !!requestingFromMember &&
    loggedInFirebaseUser.uid === requestingFromMember.uid;

  const requestInviteStatus = !!requestingFromMember
    ? getStatusOfApiCall(
        state,
        ApiEndpoint.REQUEST_INVITE,
        requestingFromMember.uid
      )
    : undefined;

  return {
    currentStep,
    isFirebaseUserLoaded,
    loggedInFirebaseUser,
    requestingFromMember,
    isOwnInvitePage,
    requestInviteStatus
  };
};

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps, ownProps) => {
  const baseMergedProps = {
    ...stateProps,
    ...ownProps,
    pushRoute: dispatchProps.pushRoute
  };
  if (!stateProps.requestingFromMember) {
    return baseMergedProps;
  }

  const requestingFromUid = stateProps.requestingFromMember.uid;
  return {
    ...baseMergedProps,
    requestInvite: (fullName: string, videoUrl: string, creatorMid: string) => {
      dispatchProps.requestInviteFromMember(
        requestingFromUid,
        fullName,
        videoUrl,
        creatorMid
      );
    }
  };
};

export default connect(
  mapStateToProps,
  {
    requestInviteFromMember: requestInviteFromMemberAction,
    pushRoute: pushRouteAction
  },
  mergeProps
)(RequestInvite);
