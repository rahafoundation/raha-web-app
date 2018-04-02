import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FormattedMessage as FM } from 'react-intl';

import { getRequestInviteOperation } from '../operations';
import { getMemberId } from '../members';
import { postOperation, fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded } from '../actions';
import { getAuthMemberDoc, getMemberDocByMid } from '../connectors';
import LogIn from './LogIn';
import YoutubeVideo, { getYoutubeUrlVideoId } from './YoutubeVideo';

const RequestInviteElem = styled.main`
  > .completelyFree {
    font-weight: bold;
  }

  > .requestInviteMessage {
    font-weight: bold;
  }
`;

export class RequestInvite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoUrl: '',
      toUid: '',
      errorMessage: '',
      fullName: props.fullName,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullName !== this.props.fullName) {
      this.setState({ fullName: nextProps.fullName });
    }
    this.fetchIfNeeded(nextProps);
  }

  fetchIfNeeded(props) {
    // TODO this logic very similar to Profile.componentWillReceiveProps.
    // Decomp/https://reactjs.org/docs/higher-order-components.html/https://github.com/acdlite/recompose
    if (props.memberId) {
      this.props.fetchMemberByMidIfNeeded(props.memberId);
    }
    if (props.authFirebaseUser) {
      this.props.fetchMemberByUidIfNeeded(props.authFirebaseUser.uid);
    }
  }

  setVideoURL = async (event: any): void => {
    this.setState({ videoUrl: event.target.value })
  }

  setFullName = async (event: any): void => {
    this.setState({ fullName: event.target.value });
  }

  handleOnSubmit = async (event: any): void => {
    event.stopPropagation();
    if (!getYoutubeUrlVideoId(this.state.videoUrl)) {
      // TODO instant validate instead of on submit, and make sure can play
      this.setState({ errorMessage: 'Please enter a valid Youtube video url' });
    } else {
      const toMemberDoc = this.props.toMemberDoc;
      const toUid = toMemberDoc.id;
      const toMid = toMemberDoc.get('mid');
      const fullName = this.state.fullName;
      const creatorMid = getMemberId(fullName);
      const videoUrl = this.state.videoUrl;
      const requestOp = getRequestInviteOperation(creatorMid, this.props.authFirebaseUser.uid, toMid, toUid, fullName, videoUrl);
      await this.props.postOperation(requestOp);  // TODO handle error
      this.setState({ submitted: true, creatorMid });
    }
  }

  clearErrorMessage(e: any): void {
    this.setState({ errorMessage: '' });
  }

  renderLogIn() {
    // TODO while login is loading user should not see the rest of page
    return (
      <div>
        <LogIn noRedirect />
        <FM id="sign_up_above" />
      </div>
    );
  }

  renderForm() {
    return (
      <div>
        <br />
        <div>
          <input
            value={this.state.fullName || ''}
            onChange={this.setFullName}
            placeholder="First and last name"
            className="InviteInput DisplayNameInput"
          />
        </div>
        <div>
          <input
            onChange={this.setVideoURL}
            placeholder="Public invite video url"
            className="InviteInput VideoUrlInput"
          />
        </div>
        <button className="InviteButton Green"
          onClick={this.handleOnSubmit}>
          Invite me!
        </button>
        <div className="InviteError">{this.state.errorMessage}</div>
        {this.state.videoUrl &&
          <div>
            <h3><FM id="join_video" /></h3>
            <YoutubeVideo youtubeUrl={this.state.videoUrl} />
          </div>
        }
      </div>
    );
  }

  render() {
    // TODO check if user already invited
    if (this.state.submitted) {
      // TODO we should instead redirect to profileUrl, which should display this message along with their video.
      const profileUrl = `${window.location.origin}/m/${this.state.creatorMid}`;
      return (
        <div>
          Your video has been submitted for review! After approval by us
          and {this.props.toMemberDoc.get('full_name')}, your profile will appear at
          <a href={profileUrl}>{profileUrl}</a>.
          We are available at <a href="mailto:help@raha.io">help@raha.io</a> if you have any questions.
        </div>
      );
    }
    if (!this.props.notSignedIn && !this.props.isAuthMemberDocLoaded) {
      // TODO the loading appears again breifly is user goes from logged out to signed in with this.renderLogIn()
      return <div>Loading</div>;
    }
    return (
      <RequestInviteElem>
        <div className="requestInviteMessage">
          <FM
            id="request_invite"
            values={{
              full_name: this.props.isToMemberDocLoaded ? this.props.toMemberDoc.get('full_name') : null,
              mid: this.props.memberId
            }}
          />
        </div>
        <div>
          <FM id="invite_me_intro" values={{ completely_free: <span className="completelyFree"><FM id="completely_free" /></span> }} />
        </div>
        {this.props.notSignedIn ? this.renderLogIn() : (this.props.isAuthLoaded ? this.renderForm() : <div>Loading</div>)}
      </RequestInviteElem>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const memberId = ownProps.match.params.memberId;
  const isAuthLoaded = state.auth.isLoaded;
  const toMemberDoc = getMemberDocByMid(state, memberId);

  const stateToPropsMap = {
    isAuthLoaded,
    memberId,
    isToMemberDocLoaded: toMemberDoc && !toMemberDoc.isFetching,
    toMemberDoc,
    notSignedIn: true,
  };

  if (!isAuthLoaded) {
    return stateToPropsMap;
  }
  const authFirebaseUser = state.auth.firebaseUser;
  if (!authFirebaseUser) {
    return stateToPropsMap;
  }
  const authMember = state.members.byUid[authFirebaseUser.uid];

  stateToPropsMap.notSignedIn = false;
  stateToPropsMap.authFirebaseUser = authFirebaseUser;
  stateToPropsMap.isAuthMemberDocLoaded = authMember && !authMember.isFetching;
  stateToPropsMap.authMemberDoc = getAuthMemberDoc(state);
  stateToPropsMap.fullName = state.auth.firebaseUser.displayName;

  return stateToPropsMap;
}

export default connect(
  mapStateToProps,
  { postOperation, fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded }
)(RequestInvite);
