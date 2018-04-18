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
import { getStatusOfApiCall } from "../../selectors/apiCalls";
import { ApiCallStatusType, ApiCallStatus } from "../../reducers/apiCalls";
import { ApiEndpoint } from "../../api";
import { getMembersByMid } from "../../selectors/members";

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
  loggedInFirebaseUser?: firebase.User;
  requestingFromMember?: Member;
  isOwnInvitePage: boolean;
  requestInviteStatus?: ApiCallStatus;
}

type RequestInviteFn = (
  fullName: string,
  videoUrl: string,
  creatorMid: string
) => void;
type MergedProps = StateProps & {
  requestInvite?: RequestInviteFn;
};

interface DispatchProps {
  requestInviteFromMember: typeof requestInviteFromMember;
}

type Props = OwnProps & MergedProps;

export class RequestInvite extends React.Component<Props> {
  public render() {
    const {
      requestingFromMember,
      loggedInFirebaseUser,
      requestInvite,
      requestInviteStatus
    } = this.props;
    if (!(requestingFromMember && loggedInFirebaseUser && requestInvite)) {
      return <Loading />;
    }

    // TODO check if user already invited
    if (
      requestInviteStatus &&
      requestInviteStatus.status === ApiCallStatusType.SUCCESS
    ) {
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
          loggedInUser={loggedInFirebaseUser}
          videoUploadRef={videoUploadRef}
          requestInvite={requestInvite}
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

interface CheckboxFields {
  age: boolean;
  inactivityDonation: boolean;
  communityStandards: boolean;
  realIdentity: boolean;
}
interface TextFields {
  fullName: string;
  videoUrl: string;
}

type FormFields = CheckboxFields & TextFields;
type FormElements = { [field in keyof FormFields]: HTMLInputElement };

interface Step4Props {
  readonly loggedInUser?: firebase.User;
  readonly videoUploadRef: firebase.storage.Reference;
  readonly requestInvite: RequestInviteFn;
}

type Step4State = { readonly [field in keyof FormFields]?: FormFields[field] };

const RequestInviteForm = styled.form`
  > .agreements {
    list-style-type: none;
    text-align: left;
    > li > label {
      display: flex;
      margin-bottom: 10px;
    }
  }
`;

class Step4 extends React.Component<Step4Props, Step4State> {
  constructor(props: Step4Props) {
    super(props);
    this.state = {};
  }

  private readonly handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {
      age,
      communityStandards,
      inactivityDonation,
      realIdentity,
      fullName,
      videoUrl
    } = this.state;

    const formElements: FormElements = e.currentTarget.elements as any;
    if (!(age && communityStandards && inactivityDonation && realIdentity)) {
      // TODO: do this more elegantly than an alert
      alert("Please agree to all the conditions first.");
      return;
    }

    if (!fullName) {
      alert("Please enter your full name.");
      return;
    }

    if (!videoUrl) {
      alert("Please upload an invite video.");
      return;
    }

    this.props.requestInvite(fullName, videoUrl, getMemberId(fullName));
  };

  private isFormValid() {
    return (
      this.state.age &&
      this.state.communityStandards &&
      this.state.inactivityDonation &&
      this.state.realIdentity &&
      this.state.fullName &&
      this.state.videoUrl
    );
  }

  private handleCheck(field: keyof CheckboxFields) {
    return (e: React.FormEvent<HTMLInputElement>) => {
      this.setState({
        [field]: e.currentTarget.checked
      });
    };
  }

  private handleChange(field: keyof TextFields) {
    return (e: React.FormEvent<HTMLInputElement>) => {
      this.setState({
        [field]: e.currentTarget.value
      });
    };
  }

  public render() {
    if (!this.props.loggedInUser) {
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
            <label>
              <input
                type="checkbox"
                name="inactivityDonation"
                onChange={this.handleCheck("inactivityDonation")}
              />
              <IntlMessage
                id="request_invite.agreements.inactivityDonation"
                onlyRenderText={true}
              />
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                name="communityStandards"
                onChange={this.handleCheck("communityStandards")}
              />
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
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                name="realIdentity"
                onChange={this.handleCheck("realIdentity")}
              />
              <IntlMessage
                id="request_invite.agreements.realIdentity"
                onlyRenderText={true}
              />
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                name="age"
                onChange={this.handleCheck("age")}
              />
              <IntlMessage
                id="request_invite.agreements.age"
                onlyRenderText={true}
              />
            </label>
          </li>
        </ul>

        <input
          type="text"
          placeholder="Your full name"
          onChange={this.handleChange("fullName")}
          {...(this.props.loggedInUser && this.props.loggedInUser.displayName
            ? {
                defaultValue: this.props.loggedInUser.displayName
              }
            : {})}
        />
        <VideoUploader
          setVideoUrl={videoUrl =>
            this.setState({ videoUrl: videoUrl ? videoUrl : undefined })
          }
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

        <Button submit={true} disabled={!this.isFormValid()}>
          Submit
        </Button>
      </RequestInviteForm>
    );
  }
}

interface WelcomeStepsProps {
  inviterName: string;
  loggedInUser?: firebase.User;
  videoUploadRef: firebase.storage.Reference;
  requestInvite: RequestInviteFn;
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
            loggedInUser={this.props.loggedInUser}
            videoUploadRef={this.props.videoUploadRef}
            requestInvite={this.props.requestInvite}
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
