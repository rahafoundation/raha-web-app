import * as firebase from 'firebase';
import * as React from 'react';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';
import { db, auth } from './firebaseInit';
import CodeOfConduct from './components/CodeOfConduct';
import LogIn from './components/LogIn';
import PageNotFound from './components/PageNotFound';
import Profile from './components/Profile';
import Splash from './components/Splash';
import store from './store';
import './App.css';

const Loading = () => {
  return <div>Loading</div>;
};

interface AppState {
  isAuthLoaded: boolean;
  authFirebaseUser: firebase.User;
  authMemberData: firebase.firestore.DocumentSnapshot;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      authFirebaseUser: null,
      authMemberData: null,
      isAuthLoaded: false
    };
  }

  componentDidMount() {
    auth.onAuthStateChanged(async authFirebaseUser => {
      if (authFirebaseUser) {
        const authMemberData = await db.collection('members').doc(authFirebaseUser.uid).get();
        this.setState({ authMemberData });
      }
      this.setState({ authFirebaseUser, isAuthLoaded: true });
    });
  }

  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="Container">
            <Switch>
              <Route exact={true} path="/" component={Splash} />
              <Route path="/login" component={LogIn} />
              <Route path="/code-of-conduct" component={CodeOfConduct} />
              <Route
                path="/me"
                render={() => {
                  if (!this.state.isAuthLoaded) {
                    return <Loading />;
                  }
                  if (this.state.authFirebaseUser === null) {
                    return <div>
                      <span>You need to </span>
                      <Redirect to={{ pathname: '/login' }} />
                    </div>;
                  }
                  // toUid: string, toMid: string, creatorMid: string
                  return <Profile
                    authFirebaseUser={this.state.authFirebaseUser}
                    authMemberData={this.state.authMemberData}
                    isMePage={true}
                  />;
                }}
              />
              <Route
                path="/m/:memberId"
                render={({ match }) => {
                  if (!this.state.isAuthLoaded || (this.state.authFirebaseUser && !this.state.authMemberData)) {
                    return <Loading />;
                  }
                  // TODO(#33) if the redux selectedMemberUid is valid, use that instead of a memberId
                  return <Profile
                    authFirebaseUser={this.state.authFirebaseUser}
                    authMemberData={this.state.authMemberData}
                    memberId={match.params.memberId}
                  />;
                }}
              />
              <Route component={PageNotFound} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
