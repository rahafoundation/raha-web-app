/**
 * A page for migrating users from G/FB auth to phone-based accounts.
 * TODO: Remove once all original users have been migrated.
 */

import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { TextInput } from "../components/TextInput";
import { Button, ButtonSize, ButtonType } from "../components/Button";
import { migrate } from "../actions";
import { ApiCallStatus, ApiCallStatusType } from "../reducers/apiCalls";
import { AppState } from "../reducers";
import { Uid } from "../identifiers";
import { getLoggedInMember } from "../selectors/auth";
import { getStatusOfApiCall } from "../selectors/apiCalls";
import { ApiEndpoint } from "../api";

interface OwnProps {}

interface StateProps {
  loggedInMemberId?: Uid;
  migrationApiCallStatus?: ApiCallStatus;
}

interface DispatchProps {
  migrate: typeof migrate;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  mobileNumber?: string;
}

class AccountMigrationComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
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
          <h4>
            Enter your mobile number below to associate it with your Raha
            account.
          </h4>
          <div style={{ display: "flex", alignItems: "center" }}>
            <TextInput
              onTextChange={value => {
                this.setState({
                  mobileNumber: value
                });
              }}
              value={this.state.mobileNumber}
              placeholder="(123) 444-5555"
            />
            {(!this.props.migrationApiCallStatus ||
              this.props.migrationApiCallStatus.status !==
                ApiCallStatusType.SUCCESS) && (
              <Button
                size={ButtonSize.LARGE}
                type={ButtonType.PRIMARY}
                onClick={() => {
                  return this.props.migrate(
                    this.props.loggedInMemberId,
                    this.state.mobileNumber
                  );
                }}
                style={{ margin: 8 }}
              >
                Submit
              </Button>
            )}
          </div>
          {this.props.migrationApiCallStatus &&
            this.props.migrationApiCallStatus.status ===
              ApiCallStatusType.FAILURE && (
              <p style={{ color: "#FF5722" }}>
                {this.props.migrationApiCallStatus.error
                  ? this.props.migrationApiCallStatus.error.message
                  : "Error transitioning your account. Please try again."}
              </p>
            )}
          {this.props.migrationApiCallStatus &&
            this.props.migrationApiCallStatus.status ===
              ApiCallStatusType.SUCCESS && (
              <div>
                <h3 style={{ color: "#4CAF50" }}>
                  Account successfully transitioned to mobile!
                </h3>
                <p>
                  Great! You should now receive a text to download and install
                  the app.
                </p>
                <p>
                  Once you've installed the app, you will need to enter your
                  mobile number once more to receive a passcode via text. Enter
                  that passocde into the app to login and use Raha!
                </p>
                <p>
                  If you have run into any issues, email us at{" "}
                  <a href="mailto:help@raha.app">help@raha.app</a> or check out
                  the migration thread on our forums. Thank you for being part
                  of the Raha network and a more equitable economy for everyone!
                </p>
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
  const loggedInMember = getLoggedInMember(state);
  const loggedInMemberId = loggedInMember ? loggedInMember.uid : undefined;
  const migrationApiCallStatus = loggedInMemberId
    ? getStatusOfApiCall(state, ApiEndpoint.MIGRATE, loggedInMemberId)
    : undefined;
  return {
    loggedInMemberId,
    migrationApiCallStatus
  };
};

export const AccountMigration = connect(mapStateToProps, { migrate })(
  AccountMigrationComponent
);
