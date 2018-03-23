import React from 'react';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
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
        <DefaultLayout path="/login" component={LogIn} />
        <DefaultLayout path="/logout" component={LogOut} />
        <DefaultLayout path="/code-of-conduct" component={CodeOfConduct} />
        <DefaultLayout path="/me" render={() => (<Redirect to='/login' replace />)} />
        <DefaultLayout path="/m/:memberId/invite" component={RequestInvite} />
        <DefaultLayout path="/m/:memberId" component={Profile} />
        <DefaultLayout path="/ops" component={Operations} />
        <DefaultLayout component={PageNotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default AppRouter;
