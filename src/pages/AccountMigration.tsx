/**
 * A page for migrating users from G/FB auth to phone-based accounts.
 * TODO: Remove once all original users have been migrated.
 */

import * as firebase from "firebase";
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import {
  AsYouTypeFormatter,
  PhoneNumberUtil,
  PhoneNumberFormat
} from "google-libphonenumber";

import { auth } from "../firebaseInit";
import { TextInput } from "../components/TextInput";
import { Button, ButtonSize, ButtonType } from "../components/Button";
import { migrate } from "../actions";
import { AppState } from "../reducers";
import { getLoggedInMember } from "../selectors/auth";
import { getStatusOfApiCall } from "../selectors/apiCalls";
import { ApiEndpoint } from "../api";

const HelpParagraph: React.StatelessComponent<{}> = () => (
  <p>
    If you have run into any issues, email us at{" "}
    <a href="mailto:help@raha.app">help@raha.app</a> or check out the migration
    thread on our forums. Thank you for being part of the Raha network and a
    more equitable economy for everyone!
  </p>
);

interface OwnProps {}

interface StateProps {
  memberIsTransitionedToMobile?: boolean;
}

interface DispatchProps {
  migrate: typeof migrate;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  mobileNumber: string;
  confirmationCode: string;

  waitingForRecaptchaVerification: boolean;
  waitingForConfirmation: boolean;
  transitionSuccessful: boolean;

  phoneNumberError?: string;
  confirmationCodeError?: string;
}

class AccountMigrationComponent extends React.Component<Props, State> {
  private recaptchaVerifier: firebase.auth.RecaptchaVerifier | undefined;
  private phoneNumberConfirmationResult:
    | firebase.auth.ConfirmationResult
    | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      mobileNumber: "",
      confirmationCode: "",
      waitingForRecaptchaVerification: true,
      waitingForConfirmation: false,
      transitionSuccessful: false
    };
  }

  public componentDidMount() {
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptchaContainer"
    );
  }

  public componentWillUnmount() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }
  }

  private updateMobileNumber = (value: string) => {
    const formatter = new AsYouTypeFormatter("US");
    let formatted = "";
    for (const num of value) {
      formatted = formatter.inputDigit(num);
    }
    this.setState({
      mobileNumber: formatted
    });
  };

  private submitPhoneNumber = async () => {
    const phoneNumberUtil = PhoneNumberUtil.getInstance();
    const mobileNumber = this.state.mobileNumber;
    let parsedMobileNumber;
    try {
      parsedMobileNumber = phoneNumberUtil.parse(mobileNumber);
    } catch {
      try {
        parsedMobileNumber = phoneNumberUtil.parse("+1" + mobileNumber);
      } catch (e) {
        this.setState({ phoneNumberError: "Phone number format is invalid." });
        return;
      }
    }
    const formattedMobileNumber = phoneNumberUtil.format(
      parsedMobileNumber,
      PhoneNumberFormat.E164
    );
    this.setState({
      phoneNumberError: undefined,
      waitingForRecaptchaVerification: true
    });
    if (this.recaptchaVerifier) {
      try {
        this.phoneNumberConfirmationResult = await auth.signInWithPhoneNumber(
          formattedMobileNumber,
          this.recaptchaVerifier
        );
        this.setState({
          waitingForRecaptchaVerification: false,
          waitingForConfirmation: true
        });
      } catch (e) {
        this.setState({
          phoneNumberError: e.message
            ? (e.message as string)
            : "An error occurred submitting your phone number. Please try again."
        });
      }
    } else {
      this.setState({
        phoneNumberError: "A Recaptcha error occurred. Please refresh the page."
      });
    }
  };

  private submitConfirmationCode = async () => {
    this.setState({
      confirmationCodeError: undefined
    });
    if (this.phoneNumberConfirmationResult) {
      try {
        const credential = firebase.auth.PhoneAuthProvider.credential(
          this.phoneNumberConfirmationResult.verificationId,
          this.state.confirmationCode
        );
        if (auth.currentUser) {
          await auth.currentUser.linkWithCredential(credential);
          this.setState({
            waitingForConfirmation: false,
            transitionSuccessful: true
          });
          // TODO REMOVE THIS
          await auth.currentUser.unlink(
            firebase.auth.PhoneAuthProvider.PROVIDER_ID
          );
          // TODO send install link via API
        }
      } catch (e) {
        this.setState({
          confirmationCodeError: e.message
            ? (e.message as string)
            : "An error occurred submitting your confirmation code. Please try again."
        });
      }
    } else {
      this.setState({
        confirmationCodeError:
          "There was an error handling your confirmation code. Please refresh the page."
      });
    }
  };

  public render() {
    const recaptchaStyle =
      this.state.waitingForRecaptchaVerification && !this.state.phoneNumberError
        ? { display: "block" }
        : { display: "none" };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: 16
          }}
        >
          <h1>Transition to the Raha Mobile App</h1>
          <p>
            We are excited to announce the launch of our new Raha mobile app for
            Android and iOS! As part of this launch, we are ending usage of our
            web application. The mobile application will provide a better
            experience and more security when using Raha.
          </p>
          <p>
            Instead of using Google or Facebook, the mobile app will simply text
            a passcode to your mobile number to log you in.
          </p>
          {this.props.memberIsTransitionedToMobile ? (
            <div>
              <h3 style={{ color: "#4CAF50" }}>
                Your account has already been successfully transitioned to
                mobile!
              </h3>
              <HelpParagraph />
            </div>
          ) : (
            <div>
              <h4>
                Enter your mobile number below to associate it with your Raha
                account.
              </h4>
              <p>
                You will receive a text message to verify your number.{" "}
                <span style={{ color: "#9E9E9E" }}>
                  Note: standard text message rates will apply.
                </span>
              </p>
              <div style={{ display: "flex", alignItems: "center" }}>
                <TextInput
                  onTextChange={this.updateMobileNumber}
                  type="tel"
                  value={this.state.mobileNumber}
                  placeholder="(123) 444-5555"
                />
                {this.state.waitingForRecaptchaVerification && (
                  <Button
                    size={ButtonSize.LARGE}
                    type={ButtonType.PRIMARY}
                    onClick={this.submitPhoneNumber}
                    style={{ margin: 8 }}
                  >
                    Submit
                  </Button>
                )}
              </div>
              <div id="recaptchaContainer" style={recaptchaStyle} />
              {this.state.phoneNumberError && (
                <p style={{ color: "#FF5722" }}>
                  {this.state.phoneNumberError}
                </p>
              )}
              {this.state.waitingForConfirmation && (
                <div>
                  <h3>Submit confirmation code</h3>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <TextInput
                      onTextChange={value => {
                        this.setState({
                          confirmationCode: value
                        });
                      }}
                      value={this.state.confirmationCode}
                      placeholder="123456"
                    />
                    <Button
                      size={ButtonSize.LARGE}
                      type={ButtonType.PRIMARY}
                      onClick={this.submitConfirmationCode}
                      style={{ margin: 8 }}
                    >
                      Submit
                    </Button>
                  </div>
                  {this.state.confirmationCodeError && (
                    <p style={{ color: "#FF5722" }}>
                      {this.state.confirmationCodeError}
                    </p>
                  )}
                </div>
              )}
              {this.state.transitionSuccessful && (
                <div>
                  <h3 style={{ color: "#4CAF50" }}>
                    Account successfully transitioned to mobile!
                  </h3>
                  <p>
                    Great! You should now receive a text to download and install
                    the app.
                  </p>
                  <p>
                    Once you've installed the app, you will use your mobile
                    number to login to Raha. You will again receive a text with
                    a passcode - enter that passcode into the app to login and
                    use Raha!
                  </p>
                  <HelpParagraph />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  AppState
> = state => {
  const userAuthProviders = auth.currentUser
    ? auth.currentUser.providerData.map(
        profile => profile && profile.providerId
      )
    : [];
  const memberIsTransitionedToMobile =
    userAuthProviders.indexOf(firebase.auth.PhoneAuthProvider.PROVIDER_ID) >= 0;

  const loggedInMember = getLoggedInMember(state);
  const loggedInMemberId = loggedInMember ? loggedInMember.uid : undefined;
  const migrationApiCallStatus = loggedInMemberId
    ? getStatusOfApiCall(state, ApiEndpoint.MIGRATE, loggedInMemberId)
    : undefined;
  return {
    memberIsTransitionedToMobile,
    loggedInMemberId,
    migrationApiCallStatus
  };
};

export const AccountMigration = connect(mapStateToProps, { migrate })(
  AccountMigrationComponent
);
