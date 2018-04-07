import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import styled from "styled-components";

import {
  fetchMemberByMidIfNeeded,
  fetchMemberByUidIfNeeded,
  postOperation
} from "../../actions";
import { getPrivateVideoInviteRef, getMemberDocByMid } from "../../connectors";
import { getMemberId, MemberDoc } from "../../members";
import { getRequestInviteOperation } from "../../operations";
import { storageRef } from '../../firebaseInit';
import { AppState } from "../../store";

import LogIn from "../../components/LogIn";
import InviteVideo from "../../components/InviteVideo";
import Loading from "../../components/Loading";
import Video from "../../components/Video";
import VideoUploader from "../../components/VideoUploader";

const RequestInviteElem = styled.main`
  > section, > form, > .inviteVideo {
    margin: 15px auto;
  }

  > section, > form {
    width: 740px;
    max-width: 80vw;
  }

  > form > * {
    margin-left: 30px;
  }

  > .completelyFree {
    font-weight: bold;
  }

  > .requestInviteMessage {
    font-weight: bold;
  }
`;

interface State {
  videoUrl: string | null;
  errorMessage?: string;
  fullName: string | null;
  submitted?: boolean;
  creatorMid?: string;
}

// TODO: could be more but this is a really confusing component
// TODO: this seems to be duplicated in multiple places
interface OwnProps {
  match: { params: { memberId: string } };
}

type Props = OwnProps & {
  authFullName: string | null;
  postOperation: typeof postOperation;
  fetchMemberByMidIfNeeded: typeof fetchMemberByMidIfNeeded;
  fetchMemberByUidIfNeeded: typeof fetchMemberByUidIfNeeded;
  isAuthLoaded: boolean;
  isAuthMemberDocLoaded: boolean;
  isToMemberDocLoaded: boolean;
  memberId: string;
  toMemberDoc: MemberDoc;
  notSignedIn: boolean;
  authFirebaseUser: { uid: string };
};

export class RequestInvite extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      videoUrl: null,
      fullName: props.authFullName
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.authFullName !== this.props.authFullName) {
      this.setState({ fullName: nextProps.authFullName });
    }
    this.fetchIfNeeded(nextProps);
  }

  private readonly fetchIfNeeded = (props: Props) => {
    // TODO this logic very similar to Profile.componentWillReceiveProps.
    // Decomp/https://reactjs.org/docs/higher-order-components.html/https://github.com/acdlite/recompose
    if (props.memberId) {
      this.props.fetchMemberByMidIfNeeded(props.memberId);
    }
    if (props.authFirebaseUser) {
      this.props.fetchMemberByUidIfNeeded(props.authFirebaseUser.uid);
    }
  }

  private readonly setVideoURL = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.setState({ videoUrl: event.currentTarget.value });
  };

  private readonly setAuthFullName = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.setState({ fullName: event.currentTarget.value });
  };

  private isOwnInvitePage() {
    return this.props.authFirebaseUser && this.props.authFirebaseUser.uid === this.props.toMemberDoc.id;
  }

  private readonly handleOnSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.stopPropagation();
    event.preventDefault();

    if (this.isOwnInvitePage()) {
      this.setState({ errorMessage: 'Sorry, cannot invite yourself!' });
      return;
    }

    if (!this.state.videoUrl || !this.state.videoUrl.startsWith('https')) {
      this.setState({ errorMessage: 'Please upload a valid video first!' });
      return;
    }

    const fullName = this.state.fullName;

    if (!fullName) {
      this.setState({ errorMessage: 'Please enter a valid full name' });
      return;
    }

    const toMemberDoc = this.props.toMemberDoc;
    const toUid = toMemberDoc.id;
    const toMid = toMemberDoc.get("mid");
    // TODO: is this how we want to handle lack of name?
    const creatorMid = getMemberId(fullName);
    const videoUrl = this.state.videoUrl;
    // TODO: should null authFullName be handled this way?
    const requestOp = getRequestInviteOperation(
      creatorMid,
      this.props.authFirebaseUser.uid,
      toMid,
      toUid,
      fullName,
      videoUrl
    );
    try {
      await this.props.postOperation(requestOp);
    } catch (e) {
      this.setState({ errorMessage: 'Failed to request invite' });
      return;
    }
    this.setState({ submitted: true, creatorMid });
  };

  private renderLogIn() {
    // TODO while login is loading user should not see the rest of page
    return (
      <div>
        <LogIn noRedirect={true} />
        <FormattedMessage id="sign_up_above" />
      </div>
    );
  }

  private renderForm() {
    const uploadRef = storageRef && getPrivateVideoInviteRef(storageRef, this.props.authFirebaseUser.uid);
    return (
      <form>
        <h3>Upload your invite video</h3>
        <input
          value={this.state.fullName || ""}
          onChange={this.setAuthFullName}
          placeholder="First and last name"
          className="InviteInput DisplayNameInput"
        />
        <VideoUploader setVideoUrl={videoUrl => this.setState({ videoUrl })} uploadRef={uploadRef} />
        <button className="InviteButton Green" onClick={this.handleOnSubmit}>
          { /* TODO: internationalize */ }
          Request Invite
        </button>
        { this.state.errorMessage &&
          <span className="InviteError">{this.state.errorMessage}</span>
        }
        {this.state.videoUrl && (<>
          <h2>
            <FormattedMessage id="join_video" />
          </h2>
          <Video videoUrl={this.state.videoUrl} />
        </>)}
      </form>
    );
  }

  public render() {
    // TODO check if user already invited
    if (this.state.submitted) {
      // TODO we should instead redirect to profileUrl, which should display this message along with their invite video.
      const profileUrl = `${window.location.origin}/m/${this.state.creatorMid}`;
      return (
        <div>
          Your video has been submitted for review! After approval by us and{" "}
          {this.props.toMemberDoc.get("full_name")}, your profile will appear at{" "}
          <a href={profileUrl}>{profileUrl}</a>. We are available at{" "}
          <a href="mailto:help@raha.io">help@raha.io</a> if you have any
          questions.
        </div>
      );
    }
    if ((!this.props.notSignedIn && !this.props.isAuthMemberDocLoaded) || !this.props.isToMemberDocLoaded) {
      // TODO the loading appears again breifly is user goes from logged out to signed in with this.renderLogIn()
      return <Loading />;
    }
    return (
      <RequestInviteElem>
        {this.isOwnInvitePage() &&
          <section><FormattedMessage id="own_invite_page" /></section>
        }
        <section className="requestInviteMessage">
          <FormattedMessage
            id="request_invite"
            values={{
              full_name: this.props.toMemberDoc.get("full_name"),
              mid: this.props.memberId
            }}
          />
        </section>
        <InviteVideo className="inviteVideo" memberId={this.props.memberId} />
        <section>
          <FormattedMessage
            id="invite_me_intro"
            values={{
              full_name: this.props.toMemberDoc.get("full_name"),
              completely_free: (
                <span className="completelyFree">
                  <FormattedMessage id="completely_free" />
                </span>
              )
            }}
          />
        </section>
        {this.props.notSignedIn ? (
          this.renderLogIn()
        ) : this.props.isAuthLoaded ? (
          this.renderForm()
        ) : (
              <Loading />
            )}
      </RequestInviteElem>
    );
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps): Partial<Props> {
  const memberId = ownProps.match.params.memberId;
  const isAuthLoaded = state.auth.isLoaded;
  const toMemberDoc = getMemberDocByMid(state, memberId);

  const stateToPropsMap = {
    isAuthLoaded,
    memberId,
    isToMemberDocLoaded: toMemberDoc && !toMemberDoc.isFetching,
    toMemberDoc,
    notSignedIn: true
  };

  if (!isAuthLoaded) {
    return stateToPropsMap;
  }
  const authFirebaseUser = state.auth.firebaseUser;
  if (!authFirebaseUser) {
    return stateToPropsMap;
  }
  const authMember = state.members.byUid[authFirebaseUser.uid];

  const extraProps = {
    ...stateToPropsMap,
    notSignedIn: false,
    authFirebaseUser,
    isAuthMemberDocLoaded: authMember && !authMember.isFetching
  };
  return state.auth.firebaseUser !== null
    ? {
      ...extraProps,
      authFullName: state.auth.firebaseUser.displayName
    }
    : extraProps;
}

export default connect(mapStateToProps, {
  postOperation,
  fetchMemberByMidIfNeeded,
  fetchMemberByUidIfNeeded
})(RequestInvite);
