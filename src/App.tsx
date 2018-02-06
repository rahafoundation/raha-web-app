import * as firebase from 'firebase';
import * as React from 'react';
import 'firebase/firestore';
import {
  BrowserRouter as Router,
  Switch,
  Link,
  Redirect,
  Route
} from 'react-router-dom';
import { FirebaseAuth } from 'react-firebaseui';

import './App.css';

const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

firebase.initializeApp(require('./data/firebase.config.json'));
const auth = firebase.auth();
const db = firebase.firestore();

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

const getYoutubeUrlVideoId = (url: string) => {
  const match = url.match(YOUTUBE_URL_REGEX);
  return (match && match[7].length === 11) ? match[7] : false;
};

interface AppState {
  userData: firebase.firestore.DocumentSnapshot;
  user: firebase.User;
  loadedUser: boolean;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      loadedUser: false,
      user: null,
      userData: null
    };
  }

  onUserDataUpdate = (userData) => { // TODO this probably does not belong in main App component
    if (userData.size !== 1) {
      // TODO console.error(`Found ${userData.size} users with query ${userData.query}`);
      return;
    }
    userData = userData.docs[0];
    this.setState({
      userData
    });
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      const state = { user } as AppState;
      if (user) {
        db.collection('user_data').where('uid', '==', user.uid).get().then(this.onUserDataUpdate);
      }
      state.loadedUser = true;
      this.setState(state);
    });
  }

  render() {
    return (
      <Router>
        <div>
        <Switch>
          <Route exact={true} path="/" component={Splash} />
          <Route path="/login" component={LogIn} />
          <Route
            path="/me"
            render={() => {
              if (this.state.loadedUser) {
                if (this.state.user === null) {
                  return <div>
                    <span>You need to </span>
                    <Redirect to={{ pathname: '/login' }} />
                  </div>;
                }
                return <Profile user={this.state.user} userData={this.state.userData} userName={null} />;
              } else {
                return <Loading />;
              }
            }}
          />
          <Route path="/m/:userName" render={({ match }) => <ProfileWithUserName userName={match.params.userName} />} />
          <Route component={PageNotFound} />
        </Switch>
        </div>
      </Router>
    );
  }
}

class ProfileWithUserName extends React.Component<HasUserName, { userData: firebase.firestore.DocumentData }> {
  constructor(props: HasUserName) {
    super(props);
    this.state = {
      userData: null
    };
  }

  onUserDataUpdate = (userData) => {
    this.setState({
      userData
    });
  }

  componentWillReceiveProps(nextProps: HasUserName) {
    if (nextProps.userName !== this.props.userName) {
      this.onPropsChange(nextProps);
    }
  }

  componentWillMount() {
    this.onPropsChange(this.props);
  }

  onPropsChange = (nextProps) => {
    db.collection('user_data').doc(nextProps.userName).get().then(this.onUserDataUpdate);
  }

  render() {
    return <Profile user={null} userData={this.state.userData} userName={this.props.userName} />;
  }
}

interface HasUserName {
  userName: string;
}

const groupSnapshotBy = (xs: firebase.firestore.QuerySnapshot, key: string) => {
  return xs.docs.reduce(
    (rv, x) => {
      const val = x.get(key);
      (rv[val] = rv[val] || []).push(x);
      return rv;
    },
    {}
  );
};

class UserRelations extends React.Component<HasUserName, {}> {
  constructor(props: HasUserName) {
    super(props);
    this.state = {};
  }

  onFromUser = (relations) => {
    let fromRelations = groupSnapshotBy(relations, 'type');
    this.setState({
      fromRelations
    });
  }

  onToUser = (relations) => {
    let toRelations = groupSnapshotBy(relations, 'type');
    this.setState({
      toRelations
    });
  }

  componentWillMount() {
    this.onPropsChange(this.props);
  }

  componentWillReceiveProps(nextProps: HasUserName) {
    if (nextProps.userName !== this.props.userName) {
      this.onPropsChange(nextProps);
    }
  }

  onPropsChange = (nextProps) => {
    db.collection('relations').where('from', '==', nextProps.userName).get().then(this.onFromUser);
    db.collection('relations').where('to', '==', nextProps.userName).get().then(this.onToUser);
  }

  addSection = (sections, stateKey, typeKey, userNameKey, title) => {
    if (this.state[stateKey] && this.state[stateKey][typeKey]) {
      const rows = this.state[stateKey][typeKey].map(s => {
        const userName = s.get(userNameKey);
        return <div id={userName} key={userName}><Link to={`/m/${userName}`}>{userName}</Link></div>;
      });
      sections.push(
        <div key={stateKey} className="UserRelations-section">
          <div>{title}</div>
          {rows}
        </div>
      );
    }
  }

  render() {
    const sections = [];
    this.addSection(sections, 'fromRelations', 'invited', 'to', 'Invited By');
    this.addSection(sections, 'toRelations', 'invited', 'from', 'Invites');
    return <div>{sections}</div>;
  }
}

const Loading = () => {
  return <div>Loading</div>;
};

const LogIn = () => {
  return <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

const Profile = ({ user, userData, userName }) => {
  userData = userData && userData.exists ? userData : null;
  if (!user && !userData) {
    return <div>User not found</div>;
  }
  let fullName = user && user.displayName;
  let youtubeUrl = null;
  if (userData) {
    userName = userName || userData.get('user_name');
    fullName = userData.get('full_name');
    youtubeUrl = userData.get('invite_url');
  }
  return (
    <div>
      <div>{fullName}</div>
      {user && user.photoURL &&
        <img src={user.photoURL} />
      }
      {youtubeUrl && <YoutubeVideo youtubeUrl={youtubeUrl} />}
      {userName && <UserRelations userName={userName} />}
    </div>
  );
};

interface YoutubeVideoProperties {
  youtubeUrl: string;
}

class YoutubeVideo extends React.Component<YoutubeVideoProperties, {}> {
  private videoObject: HTMLObjectElement;
  private videoEmbed: HTMLEmbedElement;

  render() {
    let youtubeId = getYoutubeUrlVideoId(this.props.youtubeUrl);
    return (
      <div className="Video">
        <object ref={v => { this.videoObject = v; }} >
          <div>Join Video</div>
          <param name="allowFullScreen" value="true" />
          <embed
            className="Youtube"
            ref={v => { this.videoEmbed = v; }}
            src={`https://www.youtube.com/embed/${youtubeId}?html5=1&amp;rel=0&amp;version=3`}
          />
        </object>
      </div>
    );
  }

  componentDidUpdate(prevProps: YoutubeVideoProperties, prevState: YoutubeVideoProperties) {
    if (this.props.youtubeUrl !== prevProps.youtubeUrl) {
      // This is a hack to make the Youtube video update.
      this.videoObject.appendChild(this.videoEmbed);
    }
  }
}

const RahaTitle = () => <h2><span className="Title">Raha</span><sub>alpha</sub></h2>;

const Splash = () => (
  <div className="Splash">
    <RahaTitle />
    <div className="App-intro">The Human-First Blockchain Movement</div>
    <div className="App-intro">Invite Only</div>
  </div>
);

const PageNotFound = () => (
  <div className="PageNotFound">
    <RahaTitle />
    <p><strong>404</strong> page not found</p>
    <p> ¯\_(ツ)_/¯</p>
  </div>
);

export default App;