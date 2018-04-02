import * as React from "react";
import { BrowserRouter, Route, RouteProps, Switch } from "react-router-dom";
import "../App.css";
import AppLayout from "./AppLayout";
import CodeOfConduct from "./CodeOfConduct";
import InviteMissing from "./InviteMissing";
import LogIn from "./LogIn";
import LogOut from "./LogOut";
import Operations from "./Operations";
import PageNotFound from "./PageNotFound";
import Profile from "./Profile";
import RequestInvite from "./RequestInvite";
import Splash from "./Splash";

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
        <DefaultLayout path="/m/:memberId/invite" component={RequestInvite} />
        <DefaultLayout path="/m/:memberId" component={Profile} />
        <DefaultLayout path="/ops" component={Operations} />
        <DefaultLayout component={PageNotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default AppRouter;
