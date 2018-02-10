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

interface AuthData {
  authFirebaseUser: firebase.User;
  authMemberData: firebase.firestore.DocumentSnapshot;
}

interface AppState extends AuthData {
  isAuthLoaded: boolean;
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

  onAuthMemberUpdate = (querySnap: firebase.firestore.QuerySnapshot) => {
    // TODO this probably does not belong in main App component
    if (querySnap.size !== 1) {
      // TODO console.error(`Found ${authData.size} members with query ${authData.query}`);
      return;
    }
    const authMemberData = querySnap.docs[0];
    this.setState({
      authMemberData
    });
  }

  componentDidMount() {
    auth.onAuthStateChanged(authFirebaseUser => {
      if (authFirebaseUser) {
        db.collection('user_data').where('uid', '==', authFirebaseUser.uid).get().then(this.onAuthMemberUpdate);
      }
      this.setState({ authFirebaseUser, isAuthLoaded: true });
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
                if (!this.state.isAuthLoaded) {
                  return <Loading />;
                }
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
    );
  }
}

interface ProfileProps extends AuthData {
  isMePage?: boolean;
  memberId?: string;
}

interface ProfileState {
  isMemberDataLoaded: boolean;
  isMyPage: boolean;
  memberData: firebase.firestore.DocumentData;
}

class Profile extends React.Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);
    const isMemberDataLoaded = props.isMePage && props.authMemberData ? true : false;
    this.state = {
      memberData: isMemberDataLoaded ? props.authMemberData : null,
      isMemberDataLoaded,
      isMyPage: props.isMePage
    };
  }

  onUserDataUpdate = (memberData) => {
    this.setState({
      isMemberDataLoaded: true,
      memberData
    });
  }

  componentWillReceiveProps(nextProps: ProfileProps) {
    this.onPropsChange(nextProps);
  }

  componentDidMount() {
    this.onPropsChange(this.props);
  }

  onPropsChange = (nextProps) => {
    const isMemberDataLoaded = nextProps.isMePage && nextProps.authMemberData ? true : false;
    if (!isMemberDataLoaded && nextProps.memberId) {
      // TODO probably do not need to query as much, and should change to member_data
      db.collection('user_data').doc(nextProps.memberId).get().then(this.onUserDataUpdate);
    }
    this.setState({
      memberData: isMemberDataLoaded ? nextProps.authMemberData : null,
      isMemberDataLoaded
    });
  }

  render() {
    if (!this.state.isMemberDataLoaded) {
      return <Loading />;
    }
    const memberData = this.state.memberData;
    if (!memberData) {
      if (!this.props.memberId) {
        // TODO(#8) allow user to request trust from current user, upload their youtube video.
        return (
          <div>Thank you for logging in {this.props.authFirebaseUser.displayName}!
        Now you must find someone you know to trust your account to become a Raha member.</div>
        );
      }
      // TODO make below message nice page
      return <div>Member "{this.props.memberId}" does not exist</div>;
    }
    const memberId = this.props.memberId || memberData.get('user_name'); // TODO fully migrate user_name -> member_id
    const fullName = memberData.get('full_name');
    const youtubeUrl = memberData.get('invite_url');
    // TODO the Trust button still appears when you manually visit your own page,
    // or if you are not logged in, or if already trusted. Fix!
    return (
      <div>
        <div>{fullName}</div>
        {youtubeUrl && <YoutubeVideo youtubeUrl={youtubeUrl} />}
        {!this.props.isMePage
          && <TrustButton
            toUid={memberData.get('uid')}
            toMid={memberData.get('user_name')}
            creatorMid={this.props.authMemberData.get('user_name')}
          />}
        {memberId && <MemberRelations memberId={memberId} />}
      </div>
    );
  }
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

interface MemberRelationsProps {
  memberId: string;
}

class MemberRelations extends React.Component<MemberRelationsProps, {}> {
  constructor(props: MemberRelationsProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.onPropsChange(this.props);
  }

  componentWillReceiveProps(nextProps: MemberRelationsProps) {
    if (nextProps.memberId !== this.props.memberId) {
      this.onPropsChange(nextProps);
    }
  }

  addGroupedState = (stateKey, snap, groupKey) => {
    const state = {};
    state[stateKey] = groupSnapshotBy(snap, groupKey);
    this.setState(state);
  }

  onPropsChange = (nextProps) => {
    db.collection('operations').where('creator_mid', '==', nextProps.memberId).get()
      .then(ops => this.addGroupedState('opsFromMe', ops, 'op'));
    db.collection('operations').where('data.to_mid', '==', nextProps.memberId).get()
      .then(ops => this.addGroupedState('opsToMe', ops, 'op'));
  }

  addSection = (sections, stateKey, typeKey, memberIdKey, title) => {
    if (this.state[stateKey] && this.state[stateKey][typeKey]) {
      const rows = this.state[stateKey][typeKey].map(s => {
        const memberId = s.get(memberIdKey);
        return <div id={memberId} key={memberId}><Link to={`/m/${memberId}`}>{memberId}</Link></div>;
      });
      sections.push(
        <div key={stateKey} className="MemberRelations-section">
          <div>{title}</div>
          {rows}
        </div>
      );
    }
  }

  render() {
    const sections = [];
    this.addSection(sections, 'opsFromMe', OpCode.REQUEST_INVITE, 'data.to_mid', 'Invited By');
    this.addSection(sections, 'opsToMe', OpCode.REQUEST_INVITE, 'from', 'Invites');
    this.addSection(sections, 'opsFromMe', OpCode.TRUST, 'data.to_mid', 'Trusts');
    this.addSection(sections, 'opsToMe', OpCode.TRUST, 'data.to_uid', 'Trusted by');
    return <div>{sections}</div>;
  }
}

const Loading = () => {
  return <div>Loading</div>;
};

const LogIn = () => {
  return <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

enum OpCode {
  REQUEST_INVITE = 'REQUEST_INVITE',
  TRUST = 'TRUST',
  UNTRUST = 'UNTRUST',
  FLAG = 'FLAG',
  UNFLAG = 'UNFLAG'
}

interface Operation {
  creator_uid: string;
  creator_mid: string;
  op: string;
  created_at: firebase.firestore.FieldValue;
  data: {};
  block_sequence: number;
  op_sequence: number;
}

const getOperation = (op: OpCode, creatorMid: string, data): Operation => {
  return {
    block_sequence: null,
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    creator_uid: auth.currentUser.uid,
    creator_mid: creatorMid,
    data,
    op,
    op_sequence: null
  };
};

const getTrustOperation = (toUid: string, toMid: string, creatorMid: string): Operation => {
  return getOperation(OpCode.TRUST, creatorMid, { to_uid: toUid, to_mid: toMid });
};

class TrustButton extends React.Component<{ toUid: string, toMid: string, creatorMid: string }, {}> {
  onClick = () => {
    db.collection('operations').add(getTrustOperation(this.props.toUid, this.props.toMid, this.props.creatorMid));
  }

  render() {
    return (
      <button onClick={this.onClick}>
        Trust this user
    </button>
    );
  }
}

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