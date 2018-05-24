import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import createHistory from "history/createBrowserHistory";

import "./App.css";

import AppLayout from "./pages/AppLayout";
import CodeOfConduct from "./pages/CodeOfConduct";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import InviteMissing from "./pages/InviteMissing";
import LogIn from "./components/LogIn";
import LogOut from "./pages/LogOut";
import Operations from "./pages/Operations";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";
import ProxyVotes from "./pages/ProxyVotes";
import RequestInvite from "./pages/RequestInvite";
import Splash from "./pages/Splash";
import TermsOfService from "./pages/TermsOfService";
import Leaderboard from "./pages/Leaderboard";
import Network from "./pages/Network";
import Money from "./pages/Money";

// tslint:disable-next-line:no-any
const DefaultLayout = (props: any) => {
  const { component, ...rest } = props;
  const Component = component;
  return (
    <Route
      {...rest}
      render={matchProps => (
        <AppLayout>
          <Component {...matchProps} />
        </AppLayout>
      )}
    />
  );
};

export const routerHistory = createHistory();
function AppRouter() {
  return (
    <ConnectedRouter history={routerHistory}>
      <Switch>
        <DefaultLayout exact={true} path="/" component={Splash} />
        <DefaultLayout path="/invite_missing" component={InviteMissing} />
        <DefaultLayout path="/login" component={LogIn} />
        <DefaultLayout path="/logout" component={LogOut} />
        <DefaultLayout path="/code-of-conduct" component={CodeOfConduct} />
        <DefaultLayout path="/privacy-policy" component={PrivacyPolicy} />
        <DefaultLayout
          path="/m/:memberUsername/invite"
          component={RequestInvite}
        />
        <DefaultLayout path="/m/:memberUsername/moneybeta" component={Money} />
        <DefaultLayout path="/m/:memberUsername" component={Profile} />
        <DefaultLayout path="/ops" component={Operations} />
        <DefaultLayout path="/terms-of-service" component={TermsOfService} />
        <DefaultLayout path="/leaderboard" component={Leaderboard} />
        <DefaultLayout path="/votes" component={ProxyVotes} />
        <DefaultLayout path="/network" component={Network} />
        <DefaultLayout component={PageNotFound} />
      </Switch>
    </ConnectedRouter>
  );
}

export default AppRouter;
