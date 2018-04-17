import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import styled from "styled-components";

import { requestInviteFromMember } from "../../actions";
import { getPrivateVideoInviteRef } from "../../connectors";
import { getMemberId, MemberDoc } from "../../members";
import { Member } from "../../reducers/membersNew";
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
  // TODO: Just use undefined.
  videoUrl: string | null | undefined; // Will contain video auth token, for this client only do not store
  errorMessage?: string;
  fullName: string | null | undefined;
  submitted?: boolean;
  creatorMid?: string;
}

// TODO: could be more but this is a really confusing component
// TODO: this seems to be duplicated in multiple places
interface OwnProps {
  match: { params: { memberId: string } };
}

interface StateProps {
  loggedInFullName: string | undefined | null;
  loggedInFirebaseUser: { uid: string } | null;

  requestingFromMember: Member | undefined;

  isLoading: boolean;
  isOwnInvitePage: boolean;
}

type MergedProps = StateProps & {
  requestInvite?: (
    fullName: string,
    videoUrl: string,
    creatorMid: string
  ) => void;
};

interface DispatchProps {
  requestInviteFromMember: typeof requestInviteFromMember;
}

type Props = OwnProps & MergedProps;

export class RequestInvite extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      videoUrl: null,
      fullName: props.loggedInFullName
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.loggedInFullName !== this.props.loggedInFullName) {
      this.setState({ fullName: nextProps.loggedInFullName });
    }
  }

  private readonly setVideoURL = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({ videoUrl: event.currentTarget.value });
  };

  // TODO Consider getting rid of this and converting to an uncontrolled component.
  private readonly setLoggedInFullName = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.setState({ fullName: event.currentTarget.value });
  };

  private readonly handleOnSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.stopPropagation();
    event.preventDefault();

    if (this.props.isOwnInvitePage) {
      this.setState({ errorMessage: "Sorry, cannot invite yourself!" });
      return;
    }

    if (!this.state.videoUrl || !this.state.videoUrl.startsWith("https")) {
      this.setState({ errorMessage: "Please upload a valid video first!" });
      return;
    }

    const fullName = this.state.fullName;

    if (!fullName) {
      this.setState({ errorMessage: "Please enter a valid full name!" });
      return;
    }

    const requestingFromMember = this.props.requestingFromMember;
    // TODO: is this how we want to handle lack of name?
    const creatorMid = getMemberId(fullName);
    // TODO: should null loggedInFullName be handled this way?

    if (!requestingFromMember || !this.props.loggedInFirebaseUser) {
      this.setState({
        errorMessage: "An error occurred. Could not find the expected users."
      });
      return;
    }

    try {
      if (this.props.requestInvite) {
        await this.props.requestInvite(
          fullName,
          this.state.videoUrl,
          creatorMid
        );
      } else {
        this.setState({ errorMessage: "Failed to request invite." });
      }
    } catch (e) {
      this.setState({ errorMessage: "Failed to request invite" });
      return;
    }
    this.setState({ submitted: true, creatorMid });
  };

  private renderLogIn() {
    // TODO while login is loading user should not see the rest of page
    return (
      <section>
        <div>
          <LogIn noRedirect={true} />
          <FormattedMessage id="sign_up_above" />
        </div>
      </section>
    );
  }

  private renderForm() {
    const uploadRef =
      storageRef &&
      getPrivateVideoInviteRef(
        storageRef,
        (this.props.loggedInFirebaseUser as { uid: string }).uid
      );
    return (
      <form>
        <h3>Upload your invite video</h3>
        <input
          value={this.state.fullName || ""}
          onChange={this.setLoggedInFullName}
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
    if (this.props.isLoading) {
      return <Loading />;
    }

    const requestingFromMember = this.props.requestingFromMember as Member;
    // TODO check if user already invited
    if (this.state.submitted) {
      // TODO we should instead redirect to profileUrl, which should display this message along with their invite video.
      const profileUrl = `${window.location.origin}/m/${this.state.creatorMid}`;
      return (
        <div>
          Your video has been submitted for review! After approval by us and{" "}
          {requestingFromMember.fullName}, your profile will appear at{" "}
          <a href={profileUrl}>{profileUrl}</a>. We are available at{" "}
          <a href="mailto:help@raha.io">help@raha.io</a> if you have any
          questions.
        </div>
      );
    }

    return (
      <RequestInviteElem>
        {this.props.isOwnInvitePage && (
          <section>
            <FormattedMessage id="own_invite_page" />
          </section>
        )}
        <section className="requestInviteMessage">
          <FormattedMessage
            id="request_invite"
            values={{
              full_name: requestingFromMember.fullName,
              mid: requestingFromMember.mid
            }}
          />
        </section>
        <InviteVideo
          className="inviteVideo"
          memberId={requestingFromMember.mid}
        />
        <section>
          <FormattedMessage
            id="invite_me_intro"
            values={{
              full_name: requestingFromMember.fullName,
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
        ) : this.props.loggedInFirebaseUser ? (
          this.renderForm()
        ) : (
          this.renderLogIn()
        )}
      </RequestInviteElem>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state: AppState,
  ownProps: OwnProps
) => {
  const isAuthLoaded = state.auth.isLoaded;
  const loggedInFirebaseUser = state.auth.firebaseUser;
  const loggedInMember: Member | undefined = loggedInFirebaseUser
    ? state.membersNew.byUid[loggedInFirebaseUser.uid]
    : undefined;
  // TODO: Remove null typing.
  const loggedInFullName: string | undefined | null = loggedInMember
    ? loggedInMember.fullName
    : loggedInFirebaseUser ? loggedInFirebaseUser.displayName : undefined;

  const requestingFromMid = ownProps.match.params.memberId;
  const requestingFromMember = state.membersNew.byMid[requestingFromMid];

  const isLoading = !isAuthLoaded || !requestingFromMember;

  const isOwnInvitePage =
    !isLoading &&
    !!loggedInFirebaseUser &&
    loggedInFirebaseUser.uid === requestingFromMember.uid;

  return {
    loggedInFirebaseUser,
    loggedInFullName,

    requestingFromMember,

    isLoading,
    isOwnInvitePage
  };
};

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps, ownProps) => {
  if (!stateProps.requestingFromMember) {
    return stateProps;
  }

  const requestingFromUid = stateProps.requestingFromMember.uid;
  return {
    ...stateProps,
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
  { requestInviteFromMember },
  mergeProps
)(RequestInvite);
