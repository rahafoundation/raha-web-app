import * as firebase from "firebase";
import * as React from "react";
import styled from "styled-components";

import Button, { ButtonType } from "../../../components/Button";

import { Step0, Step1, Step2, Step3, Step4 } from "./steps";
import { RequestInviteFn } from "..";

interface WelcomeStepsProps {
  readonly currentStep: number;
  readonly inviterName: string;
  readonly loggedInUser?: {
    firebaseUser: firebase.User;
    videoUploadRef: firebase.storage.Reference;
  };
  readonly requestInvite: RequestInviteFn;
  readonly navigateToStep: (stepNum: number) => void;
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
    > *:not(:last-child) {
      margin-right: 10px;
    }
  }
`;

export default class WelcomeSteps extends React.Component<WelcomeStepsProps> {
  private handleNextClick = () => {
    this.props.navigateToStep(this.props.currentStep + 1);
  };

  private handlePrevClick = () => {
    this.props.navigateToStep(this.props.currentStep - 1);
  };

  private renderCurrentStep = () => {
    switch (this.props.currentStep) {
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
        <footer>
          {this.props.currentStep > 0 && (
            <Button type={ButtonType.SECONDARY} onClick={this.handlePrevClick}>
              Back
            </Button>
          )}
          {this.props.currentStep < 4 && (
            <Button type={ButtonType.PRIMARY} onClick={this.handleNextClick}>
              Next
            </Button>
          )}
        </footer>
      </WelcomeStepsElem>
    );
  }
}
