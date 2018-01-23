import * as firebase from 'firebase';
import * as React from 'react';
import 'firebase/firestore';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';
import { FirebaseAuth } from 'react-firebaseui';

import './App.css';

firebase.initializeApp(require('./data/firebase.config.json'));
firebase.firestore();

const auth = firebase.auth();

const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/me',
  signInOptions: [
    {
      authMethod: 'https://accounts.google.com',
      clientId: '677137485282-o8enpde66k4rdppkmemh9k7l8gu71sbi.apps.googleusercontent.com',
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID
    }
  ]
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      this.setState({ user });
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Route exact={true} path="/" component={Splash} />
          <Route path="/login" component={LogIn} />
          <Route path="/me" user={this.state['user']} component={LoggedInPage} />
        </div>
      </Router>
    );
  }
}

const LogIn = () => (
  <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
);

const LoggedInPage = ({ user }) => (
  <div>This is me: {user.displayName}</div>
);

const Splash = () => (
  <div className="App">
    <div>
      <h2><span className="Title">Raha</span><sub>alpha</sub></h2>
    </div>
    <div className="App-intro">The Human-First Blockchain Movement</div>
    <div className="App-intro">Invite Only</div>
  </div>
);

export default App;
