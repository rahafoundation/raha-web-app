import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";

import { LogIn } from "../components/LogIn";
import { SSODiscourseApiEndpoint, callApi, ApiEndpoint } from "../api";
import { AppState } from "../reducers";
import { getAuthToken } from "../selectors/auth";

interface OwnProps {}

interface StateProps {
  getAuthToken: () => Promise<string | undefined>;
}

type Props = OwnProps & RouteComponentProps<void> & StateProps;

interface State {
  error?: string;
}

class SSODiscourseView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private async getRedirectUri() {
    const params = new URLSearchParams(this.props.location.search);
    const ssoRequestPayload = params.get("sso");
    const ssoRequestSignature = params.get("sig");

    if (!ssoRequestPayload || !ssoRequestSignature) {
      throw new Error(
        "Expected SSO URL parameters are not present. Please go back and try again."
      );
    }

    const authToken = await this.props.getAuthToken();
    const response = await callApi<SSODiscourseApiEndpoint>(
      {
        endpoint: ApiEndpoint.SSO_DISCOURSE,
        params: undefined,
        body: {
          ssoRequestPayload,
          ssoRequestSignature
        }
      },
      authToken
    );
    return response;
  }

  private signInSuccessCallback = () => {
    (async () => {
      try {
        const {message} = await this.getRedirectUri();
        window.location.assign(message);
      } catch (e) {
        this.setState({
          error: e.message
        });
      }
    })();
    return false;
  };

  public render() {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <LogIn
          noRedirect={true}
          signInSuccessCallback={this.signInSuccessCallback}
        />
        {this.state.error && (
          <p style={{ color: "#FF5722", maxWidth: 200 }}>{this.state.error}</p>
        )}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  AppState
> = state => {
  return {
    getAuthToken: () => getAuthToken(state)
  };
};

export const SSODiscourse = withRouter(
  connect(mapStateToProps)(SSODiscourseView)
);
