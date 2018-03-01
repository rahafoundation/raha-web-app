import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  BrowserRouter,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';
import { getAuthMemberData } from '../connectors';
import InviteForm from './InviteForm';
import CodeOfConduct from './CodeOfConduct';
import LogIn from './LogIn';
import PageNotFound from './PageNotFound';
import Profile from './Profile';
import Splash from './Splash';
import '../App.css';

const Loading = () => {
  return <div>Loading</div>;
};

class AppRouter extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="Container">
          <Switch>
            <Route exact={true} path="/" component={Splash} />
            <Route path="/login" component={LogIn} />
            <Route path="/code-of-conduct" component={CodeOfConduct} />
            <Route path="/invite" component={InviteForm} />
            <Route
              path="/me"
              render={() => {
                if (!this.props.authIsLoaded) {
                  return <Loading />;
                }
                if (this.props.authFirebaseUser === null) {
                  return <div>
                    <span>You need to </span>
                    <Redirect to={{ pathname: '/login' }} />
                  </div>;
                }
                // toUid: string, toMid: string, creatorMid: string
                return <Profile
                  authFirebaseUser={this.props.authFirebaseUser}
                  authMemberData={this.props.authMemberData}
                  isMePage={true}
                />;
              }}
            />
            <Route
              path="/m/:memberId"
              render={({ match }) => {
                if (!this.props.authIsLoaded || (this.props.authFirebaseUser && !this.props.authMemberData)) {
                  return <Loading />;
                }
                // TODO(#33) if the redux selectedMemberUid is valid, use that instead of a memberId
                return <Profile
                  authFirebaseUser={this.props.authFirebaseUser}
                  authMemberData={this.props.authMemberData}
                  memberId={match.params.memberId}
                />;
              }}
            />
            <Route component={PageNotFound} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const authIsLoaded = state.auth.isLoaded;
  const authFirebaseUser = state.auth.firebaseUser;
  let authMemberData = getAuthMemberData(state);
  return { authFirebaseUser, authMemberData, authIsLoaded };
}

export default connect(mapStateToProps, {})(AppRouter);
