import * as firebase from 'firebase';
import * as React from 'react';
import 'firebase/firestore';
import {
  BrowserRouter as Router,
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

class App extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      loadedUser: false,
      user: null,
      invites: null,
      userData: null
    };
  }

  onUserDataUpdate = (userData) => { // TODO this probably does not belong in main App component
    if (userData.size !== 1) {
      console.error(`Found ${userData.size} users with query ${userData.query}`);
      return;
    }
    userData = userData.docs[0];
    this.setState({
      userData
    });
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      const state = { user };
      if (user) {
        db.collection('user_data').where('uid', '==', user.uid).get().then(this.onUserDataUpdate);
      }
      state['loadedUser'] = true;
      this.setState(state);
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Route exact={true} path="/" component={Splash} />
          <Route path="/login" component={LogIn} />
          <Route path="/me" render={() => {
            if (this.state['loadedUser']) {
              if (this.state['user'] === null) {
                return <div><div>You need to </div><Redirect to={{
                  pathname: '/login'
                }} /></div>;
              }
              return <Profile user={this.state['user']} userData={this.state['userData']} userName={null} />;
            } else {
              return <Loading />;
            }
          }} />
          <Route path="/m/:userName" render={({match}) => <ProfileWithUserName userName={match.params.userName} />} />
        </div>
      </Router>
    );
  }
}

class ProfileWithUserName extends React.Component<HasUserName, {}> {
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.userName != this.props.userName) {
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
    return <Profile user={null} userData={this.state['userData']} userName={this.props['userName']} />;
  }
}
interface HasUserName {
  userName: string;
}

const groupSnapshotBy = (xs, key) => {
  return xs.docs.reduce((rv, x) => {
    const val = x.get(key);
    (rv[val] = rv[val] || []).push(x);
    return rv;
  }, {});
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.userName != this.props.userName) {
      this.onPropsChange(nextProps);
    }
  }

  componentWillMount() {
    this.onPropsChange(this.props);
  }

  onPropsChange = (nextProps) => {
    db.collection('relations').where('from', '==', nextProps.userName).get().then(this.onFromUser);
    db.collection('relations').where('to', '==', nextProps.userName).get().then(this.onToUser);
  }

  render() {
    if (this.state['fromRelations'] && this.state['fromRelations']['invited']) {
      const rows = this.state['fromRelations']['invited'].map(s => {
        const to = s.get('to');
        return <div><Link key={to} to={`/m/${to}`}>{to}</Link></div>;
      });
      return <div>
        <div>Invited By</div>
        {rows}
      </div>;
    }
    if (this.state['toRelations'] && this.state['toRelations']['invited']) {
      const rows = this.state['toRelations']['invited'].map(s => {
        const to = s.get('from');
        return <div><Link key={to} to={`/m/${to}`}>{to}</Link></div>;
      });
      return <div>
        <div>Invites</div>
        {rows}
      </div>;
    }
    return <div></div>;
  }
}

const Loading = () => <div>Loading</div>;

const LogIn = () => (
  <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
);

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
  return <div>
    <div>{fullName}</div>
    {user && user.photoURL &&
      <img src={user.photoURL}></img>
    }
    {youtubeUrl && <YoutubeVideo youtubeUrl={youtubeUrl} />}
    {userName && <UserRelations userName={userName} />}
  </div>;
};

class YoutubeVideo extends React.Component<any, {}> {
  // TODO this does not update correctly, seems we need to create new embed which React does not do, eg
  // https://stackoverflow.com/questions/6646413/how-to-change-the-value-of-embed-src-with-javascript
  render() {
    var youtubeId = getYoutubeUrlVideoId(this.props.youtubeUrl);
    return <div className="Video">
      <object>
        <div>Join Video</div>
        <param name="allowFullScreen" value="true" />
        <embed className="Youtube" src={`https://www.youtube.com/embed/${youtubeId}?html5=1&amp;rel=0&amp;version=3`} />
      </object>
    </div>;
  }
};

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
