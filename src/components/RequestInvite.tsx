import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import styled from "styled-components";

import {
  fetchMemberByMidIfNeeded,
  fetchMemberByUidIfNeeded,
  postOperation
} from "../actions";
import { getMemberDocByMid } from "../connectors";
import { getMemberId, MemberDoc } from "../members";
import { getRequestInviteOperation } from "../operations";
import { AppState } from "../store";
import LogIn from "./LogIn";
import YoutubeVideo, { getYoutubeUrlVideoId } from "./YoutubeVideo";

const RequestInviteElem = styled.main`
  > .completelyFree {
    font-weight: bold;
  }

  > .requestInviteMessage {
    font-weight: bold;
  }
`;

interface State {
  videoUrl: string;
  toUid: string;
  errorMessage: string;
  // TODO: why is this here if it's already in state?
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
  fullName: string | null;
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
      videoUrl: "",
      toUid: "",
      errorMessage: "",
      fullName: props.fullName
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.fullName !== this.props.fullName) {
      this.setState({ fullName: nextProps.fullName });
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

  private readonly setFullName = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.setState({ fullName: event.currentTarget.value });
  };

  private readonly handleOnSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.stopPropagation();
    if (!getYoutubeUrlVideoId(this.state.videoUrl)) {
      // TODO instant validate instead of on submit, and make sure can play
      this.setState({ errorMessage: "Please enter a valid Youtube video url" });
    } else {
      const toMemberDoc = this.props.toMemberDoc;
      const toUid = toMemberDoc.id;
      const toMid = toMemberDoc.get("mid");
      const fullName = this.state.fullName;
      // TODO: is this how we want to handle lack of name?
      const creatorMid = getMemberId(fullName || "");
      const videoUrl = this.state.videoUrl;
      // TODO: should null fullName be handled this way?
      const requestOp = getRequestInviteOperation(
        creatorMid,
        this.props.authFirebaseUser.uid,
        toMid,
        toUid,
        fullName || "",
        videoUrl
      );
      await this.props.postOperation(requestOp); // TODO handle error
      this.setState({ submitted: true, creatorMid });
    }
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
    return (
      <div>
        <br />
        <div>
          <input
            value={this.state.fullName || ""}
            onChange={this.setFullName}
            placeholder="First and last name"
            className="InviteInput DisplayNameInput"
          />
        </div>
        <div>
          <input
            onChange={this.setVideoURL}
            placeholder="Public invite video url"
            className="InviteInput VideoUrlInput"
          />
        </div>
        <button className="InviteButton Green" onClick={this.handleOnSubmit}>
          Invite me!
        </button>
        <div className="InviteError">{this.state.errorMessage}</div>
        {this.state.videoUrl && (
          <div>
            <h3>
              <FormattedMessage id="join_video" />
            </h3>
            <YoutubeVideo youtubeUrl={this.state.videoUrl} />
          </div>
        )}
      </div>
    );
  }

  public render() {
    // TODO check if user already invited
    if (this.state.submitted) {
      // TODO we should instead redirect to profileUrl, which should display this message along with their video.
      const profileUrl = `${window.location.origin}/m/${this.state.creatorMid}`;
      return (
        <div>
          Your video has been submitted for review! After approval by us and{" "}
          {this.props.toMemberDoc.get("full_name")}, your profile will appear at
          <a href={profileUrl}>{profileUrl}</a>. We are available at{" "}
          <a href="mailto:help@raha.io">help@raha.io</a> if you have any
          questions.
        </div>
      );
    }
    if (!this.props.notSignedIn && !this.props.isAuthMemberDocLoaded) {
      // TODO the loading appears again breifly is user goes from logged out to signed in with this.renderLogIn()
      return <div>Loading</div>;
    }
    return (
      <RequestInviteElem>
        <div className="requestInviteMessage">
          <FormattedMessage
            id="request_invite"
            values={{
              full_name: this.props.isToMemberDocLoaded
                ? this.props.toMemberDoc.get("full_name")
                : null,
              mid: this.props.memberId
            }}
          />
        </div>
        <div>
          <FormattedMessage
            id="invite_me_intro"
            values={{
              completely_free: (
                <span className="completelyFree">
                  <FormattedMessage id="completely_free" />
                </span>
              )
            }}
          />
        </div>
        {this.props.notSignedIn ? (
          this.renderLogIn()
        ) : this.props.isAuthLoaded ? (
          this.renderForm()
        ) : (
          <div>Loading</div>
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
        fullName: state.auth.firebaseUser.displayName
      }
    : extraProps;
}

export default connect(mapStateToProps, {
  postOperation,
  fetchMemberByMidIfNeeded,
  fetchMemberByUidIfNeeded
})(RequestInvite);
