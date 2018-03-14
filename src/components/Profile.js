import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MemberRelations from './MemberRelations';
import YoutubeVideo from './YoutubeVideo';
import { Redirect } from 'react-router-dom';
import { getAuthMemberDoc, getMemberDocByMid } from '../connectors';
import { fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded } from '../actions';
import { FormattedMessage } from 'react-intl';

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

  renderInviteInstructions() {
    const inviteUrl = `${window.location.origin}/m/${this.props.authMemberDoc.get('mid')}/invite`;
    return (
      <div>
        <FormattedMessage id="invite_others_instructions" values={{
          github_issue: <a href="https://github.com/rahafoundation/raha.io/issues">Github Issue</a>,
          full_name: this.props.authMemberDoc.get('full_name'),
          invite_link: <a href={inviteUrl}>{inviteUrl}</a>,
          ideas_email: <a href="mailto:ideas@raha.io?subject=Raha%20Improvement">ideas@raha.io</a>,
        }}/>
      </div>
    );
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
        // TODO make into it's own <ProfilePending /> component
        return <FormattedMessage
          id="invite_pending"
          values={{
            display_name: this.props.authFirebaseUser.displayName,
            help_email: <a href="mailto:help@raha.io">help@raha.io</a>
          }}
        />;
      }
      // TODO make below message nice page
      return <div>Member "{this.props.memberId}" does not exist</div>;
    }
    const fullName = memberDoc.get('full_name');
    const youtubeUrl = memberDoc.get('video_url');
    return (
      <div>
        <div className="Green MemberName">{fullName}</div>
        <h3>Invite instructions</h3>
        {this.renderInviteInstructions()}
        {youtubeUrl && <YoutubeVideo youtubeUrl={youtubeUrl} />}
        <MemberRelations uid={memberDoc.id} mid={memberDoc.get('mid')} />
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
