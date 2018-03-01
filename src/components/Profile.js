import React, { Component } from 'react';
import MemberRelations from './MemberRelations';
import YoutubeVideo from './YoutubeVideo';
import { db } from '../firebaseInit';

interface ProfileProps {
  isMePage?: boolean;
  memberId?: string;
  authFirebaseUser: firebase.User;
  authMemberData: firebase.firestore.DocumentSnapshot;
}

interface ProfileState {
  isMemberDataLoaded: boolean;
  isMyPage: boolean;
  memberData: firebase.firestore.DocumentData;
}

class Profile extends Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps: ProfileProps) {
    this.onPropsChange(nextProps);
  }

  componentDidMount() {
    this.onPropsChange(this.props);
  }

  onPropsChange = async (nextProps) => { // TODO use redux
    const isMyPage = nextProps.isMePage
      || (nextProps.authMemberData && nextProps.memberId === nextProps.authMemberData.get('mid'));
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
        <div className="Green MemberName">{fullName}</div>
        {youtubeUrl && <YoutubeVideo youtubeUrl={youtubeUrl} />}
        <MemberRelations uid={memberData.id} />
      </div>
    );
  }
}

const Loading = () => {
  return <div>Loading</div>;
};

export default Profile;
