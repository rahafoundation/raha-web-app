/**
 * Log in to Raha using your mobile number.
 */

import * as firebase from "firebase";
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { Redirect } from "react-router-dom";
import {
  AsYouTypeFormatter,
  PhoneNumberUtil,
  PhoneNumberFormat
} from "google-libphonenumber";

import { validateMobileNumber as callValidateMobileNumber } from "@raha/api/dist/me/validateMobileNumber";

import { auth } from "../firebaseInit";
import { TextInput } from "../components/TextInput";
import { Button, ButtonSize, ButtonType } from "../components/Button";
import { Link } from "../components/Link";
import { AppState } from "../reducers";
import { getLoggedInMember } from "../selectors/auth";
import { sendAppInstallText } from "../actions";
import { Loading } from "./Loading";
import { Member } from "../reducers/membersNew";
// tslint:disable-next-line:no-var-requires
const CONFIG = require("../data/config.json");

interface OwnProps {
  signInSuccessCallback?: () => boolean;
}

interface StateProps {
  loggedInMember?: Member;
  authIsLoaded: boolean;
}

interface DispatchProps {
  sendAppInstallText: typeof sendAppInstallText;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  countryCode?: string;
  regionCode?: string;
  mobileNumber: string;
  confirmationCode: string;

  submittingPhoneNumber: boolean;
  waitingForRecaptchaVerification: boolean;
  submittingConfirmationCode: boolean;
  waitingForConfirmation: boolean;
  transitionSuccessful: boolean;

  countryCodeError?: string;
  phoneNumberError?: string;
  confirmationCodeError?: string;
}

class MobileLogInComponent extends React.Component<Props, State> {
  private recaptchaContainer: any;
  private recaptchaVerifier: firebase.auth.RecaptchaVerifier | undefined;
  private phoneNumberConfirmationResult:
    | firebase.auth.ConfirmationResult
    | undefined;
  // We don't need this state to trigger a component re-render
  private formattedMobileNumber: string | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      countryCode: "+1",
      regionCode: "US",
      mobileNumber: "",
      confirmationCode: "",
      submittingPhoneNumber: false,
      waitingForRecaptchaVerification: true,
      submittingConfirmationCode: false,
      waitingForConfirmation: false,
      transitionSuccessful: false
    };
    this._handleLoggedIn();
  }

  private _handleLoggedIn() {
    if (this.props.loggedInMember && this.props.signInSuccessCallback) {
      this.props.signInSuccessCallback();
    }
  }

  /**
   * The recaptcha container may not have been rendered if the user is not
   * properly authenticated, so we need to check that the recaptcha container
   * both exists and has not already been initialized before initializing it.
   */
  private _initializeRecaptchaContainer() {
    if (this.recaptchaContainer && !this.recaptchaVerifier) {
      this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        "recaptchaContainer"
      );
    }
  }

  public componentDidMount() {
    this._initializeRecaptchaContainer();
  }

  public componentDidUpdate(prevProps: Props) {
    this._initializeRecaptchaContainer();
    if (this.props.loggedInMember) {
      this._handleLoggedIn();
    }
  }

  public componentWillUnmount() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }
  }

  private updateCountryCode = (value: string) => {
    let regionCode;
    let countryCode;
    let countryCodeError;
    if (value.length > 0) {
      countryCode = value[0] === "+" ? value : `+${value}`;
      const numericCountryCode = Number(countryCode.slice(1));
      if (Number.isNaN(numericCountryCode)) {
        countryCodeError = "Invalid country code.";
      } else {
        const phoneNumberUtil = PhoneNumberUtil.getInstance();
        regionCode = phoneNumberUtil.getRegionCodeForCountryCode(
          numericCountryCode
        );
        // The ZZ magic value comes from https://github.com/googlei18n/libphonenumber/blob/c47097bc6cfa3f5ef50997c8cd28530cd3ef5955/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L2329
        if (regionCode === "ZZ") {
          countryCodeError = "Invalid country code.";
        }
      }
    } else {
      countryCodeError = "Country code cannot be empty.";
    }

    this.setState({
      countryCode,
      regionCode,
      countryCodeError
    });
  };

  private updateMobileNumber = (value: string) => {
    if (this.state.regionCode) {
      const formatter = new AsYouTypeFormatter("US");
      let formatted = "";
      for (const num of value) {
        formatted = formatter.inputDigit(num);
      }
      this.setState({
        mobileNumber: formatted
      });
    } else {
      this.setState({
        mobileNumber: value
      });
    }
  };

  private validatePhoneNumber = async (mobileNumber: string) => {
    await callValidateMobileNumber(CONFIG.apiBase, mobileNumber);
  };

  private submitPhoneNumber = async () => {
    const phoneNumberUtil = PhoneNumberUtil.getInstance();
    const { mobileNumber, countryCode } = this.state;
    let parsedMobileNumber;

    this.setState({ submittingPhoneNumber: true });

    // Validate phone number locally
    try {
      parsedMobileNumber = phoneNumberUtil.parse(mobileNumber);
    } catch {
      try {
        parsedMobileNumber = phoneNumberUtil.parse(countryCode + mobileNumber);
      } catch (e) {
        this.setState({
          phoneNumberError: "Phone number format is invalid.",
          submittingPhoneNumber: false
        });
        return;
      }
    }
    const formattedMobileNumber = phoneNumberUtil.format(
      parsedMobileNumber,
      PhoneNumberFormat.E164
    );

    this.formattedMobileNumber = formattedMobileNumber;

    // Validate phone number against our API
    try {
      await this.validatePhoneNumber(formattedMobileNumber);
    } catch (e) {
      this.setState({
        phoneNumberError: e.message
          ? (e.message as string)
          : "An error occurred submitting your phone number. Please try again.",
        submittingPhoneNumber: false
      });
      return;
    }

    this.setState({
      phoneNumberError: undefined,
      waitingForRecaptchaVerification: true
    });

    // Submit phone number for OTP
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
            : "An error occurred submitting your phone number. Please try again.",
          submittingPhoneNumber: false
        });
      }
    } else {
      this.setState({
        phoneNumberError:
          "A Recaptcha error occurred. Please refresh the page.",
        submittingPhoneNumber: false
      });
    }
  };

  private submitConfirmationCode = async () => {
    if (this.phoneNumberConfirmationResult) {
      this.setState({
        submittingConfirmationCode: true,
        confirmationCodeError: undefined
      });

      try {
        await this.phoneNumberConfirmationResult.confirm(
          this.state.confirmationCode
        );
      } catch (e) {
        this.setState({
          confirmationCodeError: e.message
            ? (e.message as string)
            : "An error occurred submitting your confirmation code. Please try again.",
          submittingConfirmationCode: false
        });
      }
    } else {
      this.setState({
        confirmationCodeError:
          "There was an error handling your confirmation code. Please refresh the page.",
        submittingConfirmationCode: false
      });
    }
  };

  private _renderContent() {
    const recaptchaStyle =
      this.state.waitingForRecaptchaVerification &&
      !this.state.phoneNumberError &&
      !this.state.countryCodeError
        ? { display: "block" }
        : { display: "none" };

    if (this.props.loggedInMember) {
      // Redirect only if we don't have a registered onAuth callback.
      if (this.props.signInSuccessCallback) {
        return <p>Successfully logged in!</p>;
      } else {
        return (
          <Redirect to={`/m/${this.props.loggedInMember.get("username")}`} />
        );
      }
    }

    // User is signed in but no associated member.
    if (auth.currentUser) {
      return (
        <React.Fragment>
          <p>
            It looks like you logged in with an account that is not associated
            with any existing Raha member. Please log out and try again.
          </p>
          <Button
            onClick={async () => {
              await auth.signOut();
              this.forceUpdate();
            }}
          >
            Log out
          </Button>
        </React.Fragment>
      );
    }

    // Render mobile log in
    if (this.props.authIsLoaded) {
      return (
        <React.Fragment>
          <p>
            You will receive a text message to verify your number.{" "}
            <span style={styles.secondaryText}>
              Note: standard text message rates will apply.
            </span>
          </p>
          <div style={{ display: "flex", alignItems: "center" }}>
            <TextInput
              onTextChange={this.updateCountryCode}
              type="tel"
              value={this.state.countryCode}
              placeholder="+1"
              style={{ margin: 4, width: 50 }}
              disabled={this.state.submittingPhoneNumber}
            />
            <TextInput
              onTextChange={this.updateMobileNumber}
              type="tel"
              value={this.state.mobileNumber}
              placeholder="(123) 444-5555"
              style={{ margin: 4 }}
              disabled={this.state.submittingPhoneNumber}
            />
            {this.state.waitingForRecaptchaVerification && (
              <Button
                size={ButtonSize.LARGE}
                type={ButtonType.PRIMARY}
                onClick={this.submitPhoneNumber}
                style={{ margin: 4 }}
                disabled={this.state.submittingPhoneNumber}
              >
                Submit
              </Button>
            )}
          </div>
          <div
            id="recaptchaContainer"
            style={recaptchaStyle}
            ref={container => (this.recaptchaContainer = container)}
          />
          {this.state.countryCodeError && (
            <p style={styles.errorText}>{this.state.countryCodeError}</p>
          )}
          {this.state.phoneNumberError && (
            <p style={styles.errorText}>{this.state.phoneNumberError}</p>
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
                  disabled={this.state.submittingConfirmationCode}
                />
                <Button
                  size={ButtonSize.LARGE}
                  type={ButtonType.PRIMARY}
                  onClick={this.submitConfirmationCode}
                  style={{ margin: 8 }}
                  disabled={this.state.submittingConfirmationCode}
                >
                  Submit
                </Button>
              </div>
              {this.state.confirmationCodeError && (
                <p style={styles.errorText}>
                  {this.state.confirmationCodeError}
                </p>
              )}
            </div>
          )}
        </React.Fragment>
      );
    }

    // Auth is still loading.
    return <Loading />;
  }

  public render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 800,
          margin: 16
        }}
      >
        <h1>Log in to Raha</h1>
        {this._renderContent()}
        <p>
          Still using Google, Facebook, or Github to log in? Migrate your
          account <Link to="/accountMigration">here</Link>.
        </p>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  AppState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  return {
    authIsLoaded: state.auth.isLoaded,
    loggedInMember
  };
};

export const MobileLogIn = connect(mapStateToProps, {
  sendAppInstallText
})(MobileLogInComponent);

const styles = {
  successText: {
    color: "#4CAF50"
  },
  secondaryText: {
    color: "#9E9E9E"
  },
  errorText: {
    color: "#FF5722"
  }
};
