import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import styled from "styled-components";

import { postOperation } from "../../actions";
import { getPrivateVideoInviteRef } from "../../connectors";
import { getMemberId, MemberDoc } from "../../members";
import { Member } from "../../reducers/membersNew";
import { getRequestInviteOperation } from "../../operations";
import { storageRef } from "../../firebaseInit";
import { AppState } from "../../store";

import LogIn from "../../components/LogIn";
import InviteVideo from "../../components/InviteVideo";
import Loading from "../../components/Loading";
import Video from "../../components/Video";
import VideoUploader from "../../components/VideoUploader";

const RequestInviteElem = styled.main`
  > section,
  > form,
  > .inviteVideo {
    margin: 15px auto;
  }

  > section,
  > form {
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
  videoUrl: string | null; // Will contain video auth token, for this client only do not store
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
  targetMember: Member;
  notSignedIn: boolean;
  authFirebaseUser: any; // { uid: string };

  isLoading: boolean;
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
  }

  private readonly setVideoURL = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({ videoUrl: event.currentTarget.value });
  };

  private readonly setAuthFullName = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.setState({ fullName: event.currentTarget.value });
  };

  private isOwnInvitePage() {
    // tslint:disable
    debugger;
    return (
      !this.props.isLoading &&
      this.props.authFirebaseUser.uid === this.props.targetMember.uid
    );
  }

  private readonly handleOnSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.stopPropagation();
    event.preventDefault();

    if (this.isOwnInvitePage()) {
      this.setState({ errorMessage: "Sorry, cannot invite yourself!" });
      return;
    }

    if (!this.state.videoUrl || !this.state.videoUrl.startsWith("https")) {
      this.setState({ errorMessage: "Please upload a valid video first!" });
      return;
    }

    const fullName = this.state.fullName;

    if (!fullName) {
      this.setState({ errorMessage: "Please enter a valid full name" });
      return;
    }

    const targetMember = this.props.targetMember;
    // TODO: is this how we want to handle lack of name?
    const creatorMid = getMemberId(fullName);
    // TODO: should null authFullName be handled this way?
    const requestOp = getRequestInviteOperation(
      creatorMid,
      this.props.authFirebaseUser.uid,
      targetMember.mid,
      targetMember.uid,
      fullName
    );
    try {
      await this.props.postOperation(requestOp);
    } catch (e) {
      this.setState({ errorMessage: "Failed to request invite" });
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
    const uploadRef =
      storageRef &&
      getPrivateVideoInviteRef(storageRef, this.props.authFirebaseUser.uid);
    return (
      <form>
        <h3>Upload your invite video</h3>
        <input
          value={this.state.fullName || ""}
          onChange={this.setAuthFullName}
          placeholder="First and last name"
          className="InviteInput DisplayNameInput"
        />
        <VideoUploader
          setVideoUrl={videoUrl => this.setState({ videoUrl })}
          uploadRef={uploadRef}
        />
        <div>
          <FormattedMessage
            id="request_invite.terms"
            values={{
              code_of_conduct: (
                <a href="/code-of-conduct">
                  <FormattedMessage id="request_invite.code_of_conduct" />
                </a>
              ),
              privacy_policy: (
                <a href="/privacy-policy">
                  <FormattedMessage id="request_invite.privacy_policy" />
                </a>
              ),
              terms_of_service: (
                <a href="/terms-of-service">
                  <FormattedMessage id="request_invite.terms_of_service" />
                </a>
              )
            }}
          />
        </div>
        <br />
        <button className="InviteButton Green" onClick={this.handleOnSubmit}>
          {/* TODO: internationalize */}
          Request Invite
        </button>
        {this.state.errorMessage && (
          <span className="InviteError">{this.state.errorMessage}</span>
        )}
        {this.state.videoUrl && (
          <>
            <h2>
              <FormattedMessage id="join_video" />
            </h2>
            <Video videoUrl={this.state.videoUrl} />
          </>
        )}
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
          {this.props.targetMember.fullName}, your profile will appear at{" "}
          <a href={profileUrl}>{profileUrl}</a>. We are available at{" "}
          <a href="mailto:help@raha.io">help@raha.io</a> if you have any
          questions.
        </div>
      );
    }
    if (this.props.isLoading) {
      return <Loading />;
    }
    return (
      <RequestInviteElem>
        {this.isOwnInvitePage() && (
          <section>
            <FormattedMessage id="own_invite_page" />
          </section>
        )}
        <section className="requestInviteMessage">
          <FormattedMessage
            id="request_invite"
            values={{
              full_name: this.props.targetMember.fullName,
              mid: this.props.targetMember.mid
            }}
          />
        </section>
        <InviteVideo
          className="inviteVideo"
          memberId={this.props.targetMember.mid}
        />
        <section>
          <FormattedMessage
            id="invite_me_intro"
            values={{
              full_name: this.props.targetMember.fullName,
              completely_free: (
                <span className="completelyFree">
                  <FormattedMessage id="completely_free" />
                </span>
              )
            }}
          />
        </section>
        {this.props.isLoading ? (
          <Loading />
        ) : this.props.authFirebaseUser ? (
          this.renderForm()
        ) : (
          this.renderLogIn()
        )}
      </RequestInviteElem>
    );
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps): Partial<Props> {
  const isAuthLoaded = state.auth.isLoaded;
  const authFirebaseUser = isAuthLoaded ? state.auth.firebaseUser : undefined;
  const authMember: Member | undefined = authFirebaseUser
    ? state.membersNew[authFirebaseUser.uid]
    : undefined;
  const authFullName: string | undefined | null = authMember
    ? authMember.fullName
    : authFirebaseUser ? authFirebaseUser.displayName : undefined;

  const targetMid = ownProps.match.params.memberId;
  const targetMember: Member | undefined = Object.values(state.membersNew).find(
    m => m.mid === targetMid
  );

  const isLoading =
    // Loading auth
    !isAuthLoaded ||
    // Member state is unpopulated
    Object.entries(state.membersNew).length === 0;

  return {
    authFirebaseUser,
    authFullName,
    notSignedIn: !!authFirebaseUser,

    targetMember,

    isLoading
  };
}

export default connect(mapStateToProps, {
  postOperation
})(RequestInvite);
