import React, { Component } from 'react';
import { connect } from 'react-redux';
import MemberRelations from './MemberRelations';
import YoutubeVideo from './YoutubeVideo';
import { Link, Redirect } from 'react-router-dom';
import { getAuthMemberDoc, getMemberDocByMid } from '../connectors';
import { fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded } from '../actions';

interface Props {
  isMyProfile?: boolean;
  memberId: string;
  authMemberDoc: firebase.firestore.DocumentSnapshot;
  memberDoc: firebase.firestore.DocumentSnapshot;
}

class Profile extends Component<Props> {
  componentWillReceiveProps(nextProps) {
    if (nextProps.memberId) {
      this.props.fetchMemberByMidIfNeeded(nextProps.memberId);
    } else if (nextProps.isMyProfile && nextProps.authFirebaseUser) {
      this.props.fetchMemberByUidIfNeeded(nextProps.authFirebaseUser.uid);
    }
  }

  render() {
    const { authFirebaseUser, authIsLoaded, isMyProfile, memberDoc } = this.props;
    if (!authIsLoaded) {
      return <Loading />;
    }
    if (isMyProfile && !authFirebaseUser) {
      return (
        <div>
          <span>You need to </span>
          <Redirect to="/login" />
        </div>
      );
    }
    if (!memberDoc) {
      return <Loading />;
    }
    if (!memberDoc || !memberDoc.get('mid')) {
      if (!this.props.memberId) {
        // TODO(#8) allow user to request trust from current user, upload their youtube video.
        return (
          <div>
            <div>Thank you for logging in {this.props.authFirebaseUser.displayName}!</div>
            <div>To become a Raha member, go to <Link className="Green" to="/request-invite">Request Invite</Link></div>
          </div>
        );
      }
      // TODO make below message nice page
      return <div>Member "{this.props.memberId}" does not exist</div>;
    }
    const fullName = memberDoc.get('full_name');
    const youtubeUrl = memberDoc.get('video_url');
    return (
      <div>
        <div className="Green MemberName">{fullName}</div>
        {youtubeUrl && <YoutubeVideo youtubeUrl={youtubeUrl} />}
        <MemberRelations uid={memberDoc.id} mid={memberDoc.get('mid')}/>
      </div>
    );
  }
}

const Loading = () => {
  return <div>Loading</div>;  // TODO make work
};

function mapStateToProps(state, ownProps) {
  const isMyProfile = ownProps.match.path === '/me';
  const memberId = isMyProfile ? null : ownProps.match.params.memberId;
  const authIsLoaded = state.auth.isLoaded;
  const authFirebaseUser = state.auth.firebaseUser;
  const authMemberDoc = getAuthMemberDoc(state);  // TODO will we use this?
  const memberDoc = isMyProfile ? authMemberDoc : getMemberDocByMid(state, memberId);
  return { authFirebaseUser, authMemberDoc, authIsLoaded, isMyProfile, memberDoc, memberId };
}

export default connect(mapStateToProps, { fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded })(Profile);
