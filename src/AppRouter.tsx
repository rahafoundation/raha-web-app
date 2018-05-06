import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
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
import RequestInvite from "./pages/RequestInvite";
import Splash from "./pages/Splash";
import TermsOfService from "./pages/TermsOfService";

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

function AppRouter() {
  return (
    <BrowserRouter>
      <Switch>
        <DefaultLayout exact={true} path="/" component={Splash} />
        <DefaultLayout path="/invite_missing" component={InviteMissing} />
        <DefaultLayout path="/login" component={LogIn} />
        <DefaultLayout path="/logout" component={LogOut} />
        <DefaultLayout path="/code-of-conduct" component={CodeOfConduct} />
        <DefaultLayout path="/privacy-policy" component={PrivacyPolicy} />
        <DefaultLayout path="/m/:memberId/invite" component={RequestInvite} />
        <DefaultLayout path="/m/:memberMid" component={Profile} />
        <DefaultLayout path="/ops" component={Operations} />
        <DefaultLayout path="/terms-of-service" component={TermsOfService} />
        <DefaultLayout component={PageNotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default AppRouter;
