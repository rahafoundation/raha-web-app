import * as React from "react";
import styled from "styled-components";

import IntlMessage from "../../../components/IntlMessage";
import { RequestInviteFn } from "..";
import { getMemberId } from "../../../members";
import LogIn from "../../../components/LogIn";
import Button from "../../../components/Button";
import Video from "../../../components/Video";
import VideoUploader from "../../../components/VideoUploader";
import TextInput from "../../../components/TextInput";

export const Step0: React.StatelessComponent<{ inviterName: string }> = ({
  inviterName
}) => {
  return (
    <IntlMessage
      id="request_invite.step0"
      values={{ inviter_name: inviterName }}
    />
  );
};

export const Step1: React.StatelessComponent<{}> = () => (
  <IntlMessage id="request_invite.step1" />
);

export const Step2: React.StatelessComponent<{}> = () => (
  <IntlMessage id="request_invite.step2" />
);

export const Step3: React.StatelessComponent<{ inviterName: string }> = ({
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
// type FormElements = { [field in keyof FormFields]: HTMLInputElement };

interface Step4Props {
  readonly requestInvite: RequestInviteFn;
  readonly loggedInUser?: {
    firebaseUser: firebase.User;
    videoUploadRef: firebase.storage.Reference;
  };
}

type Step4State = { readonly [field in keyof FormFields]?: FormFields[field] };

const RequestInviteForm = styled.form`
  .nameInput {
    display: block;
    color: #333;
  }

  .nameInputBox {
    margin-left: 10px;
  }

  > .agreements {
    list-style-type: none;
    text-align: left;
    > li > label {
      display: flex;
      > *:not(:last-child) {
        margin-right: 10px;
        flex-shrink: 0;
      }
    }
    li {
      margin-bottom: 10px;
    }
  }
  > *:not(:last-child) {
    margin-bottom: 20px;
  }
`;

export class Step4 extends React.Component<Step4Props, Step4State> {
  constructor(props: Step4Props) {
    super(props);

    // initialize state to contain name if it's there
    const displayName = props.loggedInUser
      ? props.loggedInUser.firebaseUser.displayName
      : undefined;
    this.state = {
      fullName: displayName ? displayName : ""
    };
  }

  public componentDidUpdate(prevProps: Step4Props) {
    // upidate to contain name if just logged in
    if (this.props.loggedInUser === prevProps.loggedInUser) {
      return;
    }

    const displayName = this.props.loggedInUser
      ? this.props.loggedInUser.firebaseUser.displayName
      : undefined;
    if (!displayName) {
      return;
    }

    this.setState({ fullName: displayName });
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
    return (value: string) => {
      this.setState({ [field]: value });
    };
  }

  public render() {
    if (!this.props.loggedInUser) {
      return (
        <>
          <IntlMessage id="sign_up" />
          <LogIn noRedirect={true} />
        </>
      );
    }

    const { videoUploadRef, firebaseUser } = this.props.loggedInUser;

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
              <IntlMessage id="request_invite.agreements.inactivityDonation" />
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                name="communityStandards"
                onChange={this.handleCheck("communityStandards")}
              />
              <IntlMessage id="request_invite.agreements.communityStandards" />
            </label>
            <ul>
              <li>
                <a href="/code-of-conduct">
                  <IntlMessage
                    id="request_invite.code_of_conduct"
                    onlyRenderText={true}
                  />
                </a>
              </li>
              <li>
                <a href="/privacy-policy">
                  <IntlMessage
                    id="request_invite.privacy_policy"
                    onlyRenderText={true}
                  />
                </a>
              </li>
              <li>
                <a href="/terms-of-service">
                  <IntlMessage
                    id="request_invite.terms_of_service"
                    onlyRenderText={true}
                  />
                </a>
              </li>
            </ul>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                name="realIdentity"
                onChange={this.handleCheck("realIdentity")}
              />
              <IntlMessage id="request_invite.agreements.realIdentity" />
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                name="age"
                onChange={this.handleCheck("age")}
              />
              <IntlMessage id="request_invite.agreements.age" />
            </label>
          </li>
        </ul>

        <label className="nameInput">
          Full name:
          <TextInput
            placeholder="Your full name"
            className="nameInputBox"
            onTextChange={this.handleChange("fullName")}
            {...(firebaseUser.displayName
              ? {
                  defaultValue: firebaseUser.displayName
                }
              : {})}
          />
        </label>
        <VideoUploader
          setVideoUrl={videoUrl =>
            this.setState({ videoUrl: videoUrl ? videoUrl : undefined })
          }
          uploadRef={videoUploadRef}
        />
        {this.state.videoUrl && (
          <>
            <h2>
              <IntlMessage id="join_video" />
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
