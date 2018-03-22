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
import '../App.css';

function AppRouter() {
  return (
    <BrowserRouter>
      <div className="Container">
        <Switch>
          <Route exact={true} path="/" component={Splash} />
          <Route path="/login" component={LogIn} />
          <Route path="/logout" component={LogOut} />
          <Route path="/code-of-conduct" component={CodeOfConduct} />
          <Route path="/me" render={() => (<Redirect to='/login' replace />)} />
          <Route path="/m/:memberId/invite" component={RequestInvite} />
          <Route path="/m/:memberId" component={Profile} />
          <Route path="/ops" component={Operations} />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
