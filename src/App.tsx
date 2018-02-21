import * as firebase from 'firebase';
import * as React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Link,
  Redirect,
  Route
} from 'react-router-dom';

import { FirebaseAuth } from 'react-firebaseui';
import { Provider, connect } from 'react-redux';

import { fetchMemberIfNeeded } from './actions';
import store from './store';
import './App.css';

const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

import { db, auth } from './firebaseInit';

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

export class App extends React.Component<{}, AppState> {
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
    this.state = {} as ProfileState;
  }

  componentWillReceiveProps(nextProps: ProfileProps) { // WTODO needed???
    this.onPropsChange(nextProps);
  }

  componentDidMount() {
    this.onPropsChange(this.props);
  }

  onPropsChange = async (nextProps) => {
    const isMyPage = nextProps.isMePage || nextProps.memberId === nextProps.authMemberData.get('mid');
    let isMemberDataLoaded;
    let memberData;
    if (isMyPage) {
      isMemberDataLoaded = true;
      memberData = nextProps.authMemberData;
    } else {
      isMemberDataLoaded = this.state.memberData && this.state.memberData.get('mid') === nextProps.memberId;
      memberData = isMemberDataLoaded ? this.state.memberData : null;
      if (!isMemberDataLoaded) {
        // TODO(#33) should not be querying firestore outside of actions.ts
        const memberQuery = await db.collection('members').where('mid', '==', nextProps.memberId).get();
        memberData = memberQuery.docs[0];
        isMemberDataLoaded = true;
      }
    }
    this.setState({ isMemberDataLoaded, isMyPage, memberData });
  }

  canTrustThisUser() {
    return this.props.authMemberData !== null && this.props.authMemberData.get('mid') !== this.props.memberId;
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
    const fullName = memberData.get('full_name');
    const youtubeUrl = memberData.get('video_url');
    return (
      <div>
        <div>{fullName}</div>
        {this.canTrustThisUser()
          && <TrustButton
            toUid={memberData.get('uid')}
            toMid={memberData.get('mid')}
            creatorMid={this.props.authMemberData.get('mid')}
          />}
        {youtubeUrl && <YoutubeVideo youtubeUrl={youtubeUrl} />}
        <MemberRelations uid={memberData.id} />
      </div>
    );
  }
}

type OpCodeToDocs = Map<string, firebase.firestore.DocumentSnapshot>;

interface MemberRelationsProps {
  uid: string;
}

interface MemberRelationsState {
  ops: OpCodeToDocs;
  trustedByUids: Map<string, string>;
  trustsUids: Map<string, string>;
  invitedByUids: Map<string, string>;
  invitedUids: Map<string, string>;
}

class MemberRelations extends React.Component<MemberRelationsProps, MemberRelationsState> {
  constructor(props: MemberRelationsProps) {
    super(props);
    this.state = { ops: null, trustedByUids: null, trustsUids: null, invitedByUids: null, invitedUids: null };
  }

  componentDidMount() {
    this.onPropsChange(this.props);
  }

  componentWillReceiveProps(nextProps: MemberRelationsProps) {
    if (nextProps.uid !== this.props.uid) {
      this.onPropsChange(nextProps);
    }
  }

  addOpsGroup = async (fieldPath, uid) => {
    const snap = await db.collection('operations').where(fieldPath, '==', uid).orderBy('op_seq').get();
    return snap.docs.reduce((res, s) => res.set(s.id, s), new Map());
  }

  getKeysForOps = (
    documents: Map<string, firebase.firestore.DocumentSnapshot>,
    opCode: OpCode, idKey: string
  ): Map<string, string> => {
    const res = new Map();
    documents.forEach((opDoc, opId) => {
      if (opDoc.get('op_code') === opCode) {
        const uid = opDoc.get(idKey);
        if (uid !== null) {
          res.set(uid, opId);
        }
      }
    });
    return res;
  }

  onPropsChange = async (props) => {
    const [sentOps, receivedOps] = await Promise.all([
      this.addOpsGroup('creator_uid', props.uid),
      this.addOpsGroup('data.to_uid', props.uid)
    ]);
    const trustedByUids = this.getKeysForOps(receivedOps, OpCode.TRUST, 'creator_uid');
    const trustsUids = this.getKeysForOps(sentOps, OpCode.TRUST, 'data.to_uid');
    const invitedByUids = this.getKeysForOps(sentOps, OpCode.REQUEST_INVITE, 'data.to_uid');
    const invitedUids = this.getKeysForOps(receivedOps, OpCode.REQUEST_INVITE, 'creator_uid');
    // By default you trust the person your requested invite from.
    invitedByUids.forEach((doc, uid) => trustsUids.set(uid, doc));
    // People who request invite from you are saying that they trust you.
    invitedUids.forEach((doc, uid) => trustedByUids.set(uid, doc));
    // TODO handle untrust,  vote
    this.setState({ ops: Object.assign(sentOps, receivedOps), trustedByUids, trustsUids, invitedByUids, invitedUids });
  }

  addSection = (sections, sectionUids, title) => {
    if (sectionUids.size > 0) {
      // TODO(#14) should intially get memberUid, then do db.batch() for all additional member info (pic, full_name)
      // const ops = this.state.ops;
      const rows = Array.from(sectionUids.entries()).map((opIdAndUid: Array<string>) => {
        const [uid, opId] = opIdAndUid;
        return <MemberThumbnail applied={true} key={uid} uid={uid} />;
      });
      sections.push(
        <div key={title} className="MemberRelations-section">
          <div className="SectionTitle">{`${title} (${rows.length})`}</div>
          {rows}
        </div>
      );
    }
  }

  render() {
    const sections = [];
    if (this.state.ops) {
      this.addSection(sections, this.state.invitedByUids, 'Invited By');
      this.addSection(sections, this.state.invitedUids, 'Invites');
      this.addSection(sections, this.state.trustedByUids, 'Trusted by');
      this.addSection(sections, this.state.trustsUids, 'Trusts');
    }
    return <div>{sections}</div>;
  }
}

const Loading = () => {
  return <div>Loading</div>;
};

const LogIn = () => {
  return <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

// TODO code duplication in functions/srs/index.ts, decomp.
enum OpCode {
  ADMIN = 'ADMIN',
  FLAG = 'FLAG',
  REQUEST_INVITE = 'REQUEST_INVITE',
  TRUST = 'TRUST',
  UNADMIN = 'UNADMIN',
  UNFLAG = 'UNFLAG',
  UNTRUST = 'UNTRUST',
  VOTE = 'VOTE'
}

interface ToId {
  to_mid: string;
  to_uid: string;
}

interface RequestInviteOpData extends ToId {
  video_url: string;
  full_name: string;
}

interface TrustOpData extends ToId { }

interface Operation {
  applied: false;
  block_at: Date;
  block_seq: number;
  created_at: Date; // firebase.firestore.FieldValue;
  creator_mid: string;
  creator_uid: string;
  data: (TrustOpData | RequestInviteOpData);
  op_code: OpCode;
  op_seq: number;
}

const getOperation = (opCode: OpCode, creatorMid: string, data): Operation => {
  return {
    applied: false,
    block_at: null,
    block_seq: null,
    created_at: new Date(),
    creator_uid: auth.currentUser.uid,
    creator_mid: creatorMid,
    data,
    op_code: opCode,
    op_seq: null
  };
};

const getTrustOperation = (toUid: string, toMid: string, creatorMid: string): Operation => {
  return getOperation(OpCode.TRUST, creatorMid, { to_uid: toUid, to_mid: toMid });
};

// TODO(#8) instead of only trust, should be multi-functional button
class TrustButton extends React.Component<{ toUid: string, toMid: string, creatorMid: string }, {}> {
  onClick = () => {
    const trustOp = getTrustOperation(this.props.toUid, this.props.toMid, this.props.creatorMid);
    // TODO support this
    alert(`This operation for upserting ${JSON.stringify(trustOp)} not supported yet.`);
  }

  render() {
    return (
      <button onClick={this.onClick}>
        Trust
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
    const youtubeId = getYoutubeUrlVideoId(this.props.youtubeUrl);
    // TODO Chrome console errors with this object embed, investigate.
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

interface MemberThumbnailProps {
  uid: string;
  applied: boolean;
  memberData?: firebase.firestore.DocumentData;
}

// TODO(#14) improve this thumbnail
class MemberThumbnailComp extends React.Component<MemberThumbnailProps, {}> {
  componentDidMount() {
    fetchMemberIfNeeded(this.props.uid); // TODO memberUid;
  }
  render() {
    const memberDoc = this.props.memberData && this.props.memberData.doc;
    if (!memberDoc) {
      return <div className="MemberThumbnail"><Loading /></div>;
    }
    const mid = memberDoc.get('mid');
    const name = memberDoc.get('full_name');
    return (
      <div className="MemberThumbnail">
        <Link to={`/m/${mid}`}>{name}</Link>
      </div>
    );
  }
}

const MemberThumbnail = connect(
  (state, ownProps: MemberThumbnailProps) => {
    return { memberData: state.uidToMembers[ownProps.uid] };
  },
  null
)(MemberThumbnailComp);

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
    <p>¯\_(ツ)_/¯</p>
  </div>
);
