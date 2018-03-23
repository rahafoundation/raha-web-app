import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import MemberRelations from './MemberRelations';
import TrustLevel from './TrustLevel';
import ActionButton from './ActionButton';
import YoutubeVideo from './YoutubeVideo';
import { getAuthMemberDoc, getMemberDocByMid } from '../connectors';
import { fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded } from '../actions';
import { getMemberUidToOp } from '../helpers/ops';
import { OpCode } from '../operations';

interface Props {
  isMyProfile?: boolean;
  memberId: string;
  authMemberDoc: firebase.firestore.DocumentSnapshot;
  memberDoc: firebase.firestore.DocumentSnapshot;
}

const ProfileElem = styled.main`
  padding: 0 20px;
  > header {
    margin-bottom: 20px;

    > .memberTitle {
      display: flex;
      align-items: center;

      .trustButton {
        margin-left: 20px;
      }
    }
  }

  .joinVideo {
    width: 600px;
    height: 400px;
  }
`

class Profile extends Component<Props> {
  componentWillReceiveProps(nextProps) {
    if (nextProps.memberId) {
      this.props.fetchMemberByMidIfNeeded(nextProps.memberId);
    } else if (nextProps.isMyProfile && nextProps.authFirebaseUser) {
      this.props.fetchMemberByUidIfNeeded(nextProps.authFirebaseUser.uid);
    }
  }

  canTrustThisUser() {
    return this.props.authMemberDoc !== null
      && this.props.authMemberDoc.id !== this.props.uid
      && !this.props.trustedByUids.has(this.props.authMemberDoc.id);
  }

  isOwnProfile(uid) {
    return this.props.authMemberDoc && this.props.authMemberDoc.uid === uid;
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
      <ProfileElem>
        <header>
          <h1 className="memberTitle">
            {fullName}

            {
              this.canTrustThisUser() &&
              <ActionButton
                className="trustButton"
                toUid={this.props.uid}
                toMid={this.props.mid}
              />
            }
          </h1>
          {
            // TODO ops should also go in redux, should count number for when
            // people have different trust levels
            this.props.trustedByUids !== undefined &&
            <TrustLevel
              ownProfile={this.isOwnProfile(memberDoc.id, this.props.authMemberDoc)}
              trustLevel={3}
              networkJoinDate={null}
              trustedByLevel2={null}
              trustedByLevel3={null}
            />
          }
        </header>

        <main>
          {
            youtubeUrl && <YoutubeVideo
              className="joinVideo" youtubeUrl={youtubeUrl}
            />
          }

          <MemberRelations uid={memberDoc.id} mid={memberDoc.get('mid')} />
        </main>
      </ProfileElem>
    );
  }
}

const Loading = () => {
  return <div>Loading</div>;  // TODO make work
};

function mapStateToProps(state, ownProps) {
  const isMyProfile = ownProps.match.path === '/me';
  const authMemberDoc = getAuthMemberDoc(state);
  const memberId = isMyProfile ? null : ownProps.match.params.memberId;

  const receivedOps = Object.entries(state.uidToOpMeta).filter(uidOp => uidOp[1].op.applied && uidOp[1].op.data.to_uid === ownProps.uid);
  return {
    // TODO I think this doesn't actually work? /me redirects
    isMyProfile,
    memberId,
    authIsLoaded: state.auth.isLoaded,
    authFirebaseUser: state.auth.firebaseUser,
    authMemberDoc,  // TODO will we use this?
    memberDoc: isMyProfile ? authMemberDoc : getMemberDocByMid(state, memberId),
    trustedByUids: getMemberUidToOp(receivedOps, OpCode.TRUST, x => x.creator_uid)
  };
}

export default connect(mapStateToProps, { fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded })(Profile);
