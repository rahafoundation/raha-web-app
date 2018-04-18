import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import styled from "styled-components";

import { Uid } from "../../identifiers";
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
import Button from "../../components/Button";
import IntlMessage from "../../components/IntlMessage";
import { Redirect } from "react-router-dom";
import { lightGreen } from "../../constants/palette";
import { lightBlue500, blueGrey300 } from "material-ui/styles/colors";

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
  loggedInFullName?: string;
  loggedInFirebaseUser?: { uid: string };

  requestingFromMember?: Member;

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
        <div />
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
    const { requestingFromMember, loggedInFirebaseUser } = this.props;
    if (!requestingFromMember || !loggedInFirebaseUser) {
      return <Loading />;
    }

    // TODO check if user already invited
    if (this.state.submitted) {
      const profileUrl = `${window.location.origin}`;
      return <Redirect to={profileUrl} />;
    }

    const videoUploadRef =
      storageRef &&
      getPrivateVideoInviteRef(storageRef, loggedInFirebaseUser.uid);

    return (
      <RequestInviteElem>
        {this.props.isOwnInvitePage && (
          <header>
            <IntlMessage id="own_invite_page" className="ownInvitePage" />
          </header>
        )}
        <WelcomeSteps
          inviterName={requestingFromMember.fullName}
          hasLoggedIn={!!loggedInFirebaseUser}
          videoUploadRef={videoUploadRef}
        />
      </RequestInviteElem>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state: AppState,
  ownProps: OwnProps
) => {
  const loggedInFirebaseUser = state.auth.firebaseUser;
  const isAuthLoaded = !!state.auth.firebaseUser;
  const loggedInMember: Member | undefined = loggedInFirebaseUser
    ? state.membersNew.byUid[loggedInFirebaseUser.uid]
    : undefined;
  // TODO: Remove null typing.
  const loggedInFullName: string | null | undefined = loggedInMember
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
    loggedInFullName: loggedInFullName || undefined,

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

interface FormElements {
  age: HTMLInputElement;
  inactivityDonation: HTMLInputElement;
  communityStandards: HTMLInputElement;
  realIdentity: HTMLInputElement;
  fullName: HTMLInputElement;
  videoUrl: HTMLInputElement;
}
export default connect(
  mapStateToProps,
  { requestInviteFromMember },
  mergeProps
)(RequestInvite);

const Step0: React.StatelessComponent<{ inviterName: string }> = ({
  inviterName
}) => {
  return (
    <IntlMessage
      id="request_invite.step0"
      values={{ inviter_name: inviterName }}
    />
  );
};

const Step1: React.StatelessComponent<{}> = () => (
  <IntlMessage id="request_invite.step1" />
);

const Step2: React.StatelessComponent<{}> = () => (
  <IntlMessage id="request_invite.step2" />
);

const Step3: React.StatelessComponent<{ inviterName: string }> = ({
  inviterName
}) => (
  <IntlMessage
    id="request_invite.step3"
    values={{ inviter_name: inviterName }}
  />
);

interface Step4Props {
  hasLoggedIn: boolean;
  videoUploadRef: firebase.storage.Reference;
}

interface Step4State {
  videoUrl: string | null;
}

const RequestInviteForm = styled.form`
  > .agreements {
    list-style-type: none;
    text-align: left;
    > li {
      display: flex;
      margin-bottom: 10px;
    }
  }
`;

class Step4 extends React.Component<Step4Props, Step4State> {
  constructor(props: Step4Props) {
    super(props);
    this.state = {
      videoUrl: null
    };
  }

  private readonly handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElements: FormElements = e.currentTarget.elements as any;
    alert(formElements.age.checked);
  };

  public render() {
    if (!this.props.hasLoggedIn) {
      return (
        <>
          <FormattedMessage id="sign_up" />
          <LogIn noRedirect={true} />
        </>
      );
    }

    return (
      <RequestInviteForm onSubmit={this.handleSubmit}>
        <ul className="agreements">
          <li>
            <input type="checkbox" name="inactivityDonation" />
            <IntlMessage
              id="request_invite.agreements.inactivityDonation"
              onlyRenderText={true}
            />
          </li>
          <li>
            <input type="checkbox" name="communityStandards" />
            <IntlMessage
              id="request_invite.agreements.communityStandards"
              values={{
                code_of_conduct: (
                  <a href="/code-of-conduct">
                    <IntlMessage
                      id="request_invite.code_of_conduct"
                      onlyRenderText={true}
                    />
                  </a>
                ),
                privacy_policy: (
                  <a href="/privacy-policy">
                    <IntlMessage
                      id="request_invite.privacy_policy"
                      onlyRenderText={true}
                    />
                  </a>
                ),
                terms_of_service: (
                  <a href="/terms-of-service">
                    <IntlMessage
                      id="request_invite.terms_of_service"
                      onlyRenderText={true}
                    />
                  </a>
                )
              }}
            />
          </li>
          <li>
            <input type="checkbox" name="realIdentity" />
            <IntlMessage
              id="request_invite.agreements.realIdentity"
              onlyRenderText={true}
            />
          </li>
          <li>
            <input type="checkbox" name="age" />
            <IntlMessage
              id="request_invite.agreements.age"
              onlyRenderText={true}
            />
          </li>
        </ul>

        <VideoUploader
          setVideoUrl={videoUrl => this.setState({ videoUrl })}
          uploadRef={this.props.videoUploadRef}
        />
        {this.state.videoUrl && (
          <>
            <h2>
              <FormattedMessage id="join_video" />
            </h2>
            <Video videoUrl={this.state.videoUrl} />
          </>
        )}

        <Button submit={true}>Submit</Button>
      </RequestInviteForm>
    );
  }
}

interface WelcomeStepsProps {
  inviterName: string;
  hasLoggedIn: boolean;
  videoUploadRef: firebase.storage.Reference;
}

interface WelcomeStepsState {
  currentStep: number;
}

const WelcomeStepsElem = styled.main`
  display: flex;
  flex-direction: column;

  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;

  > .step {
    margin-bottom: 20px;
    text-align: center;
  }
  > footer {
    text-align: center;
  }
`;
class WelcomeSteps extends React.Component<
  WelcomeStepsProps,
  WelcomeStepsState
> {
  constructor(props: WelcomeStepsProps) {
    super(props);

    this.state = {
      currentStep: 0
    };
  }

  private handleNextClick = () => {
    this.setState({ currentStep: this.state.currentStep + 1 });
  };

  private renderCurrentStep = () => {
    switch (this.state.currentStep) {
      case 0:
        return <Step0 inviterName={this.props.inviterName} />;
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 inviterName={this.props.inviterName} />;
      case 4:
        return (
          <Step4
            hasLoggedIn={this.props.hasLoggedIn}
            videoUploadRef={this.props.videoUploadRef}
          />
        );
      default:
        break;
    }
    // TODO: real logging, alerting
    // tslint:disable-next-line
    console.error("Invalid step number");
    return <></>;
  };

  public render() {
    return (
      <WelcomeStepsElem>
        <section className="step">{this.renderCurrentStep()}</section>
        {this.state.currentStep < 4 && (
          <footer>
            <Button className="nextBtn" onClick={this.handleNextClick}>
              Next
            </Button>
          </footer>
        )}
      </WelcomeStepsElem>
    );
  }
}
