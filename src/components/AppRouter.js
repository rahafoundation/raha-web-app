import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import CodeOfConduct from './CodeOfConduct';
import LogIn from './LogIn';
import LogOut from './LogOut';
import Operations from './Operations';
import PageNotFound from './PageNotFound';
import Profile from './Profile';
import RequestInvite from './RequestInvite';
import Splash from './Splash';
import AppLayout from './AppLayout';
import '../App.css';
import InviteMissing from './InviteMissing';

const DefaultLayout = (props) => {
  const {component, ...rest} = props;
  const Component = component;
  return (
    <Route
      {...rest} render={matchProps => (
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
