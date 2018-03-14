import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { getRequestInviteOperation } from '../operations';
import { getMemberId } from '../members';
import { postOperation, fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded } from '../actions';
import { getAuthMemberDoc, getMemberDocByMid } from '../connectors';
import LogIn from './LogIn';
import YoutubeVideo, { getYoutubeUrlVideoId } from './YoutubeVideo';

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
      this.setState({ submitted: true });
    }
  }

  clearErrorMessage(e: any): void {
    this.setState({ errorMessage: '' });
  }

  renderLogIn() {
    return (
      <div>
        <LogIn noRedirect />
        <FormattedMessage id="sign_up_above" />
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
        {this.state.videoUrl && <YoutubeVideo youtubeUrl={this.state.videoUrl} />}
      </div>
    );
  }

<<<<<<< HEAD
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
=======
  renderDirections() {
    return (
      <div>
        <div>
          We are excited to have you become a member of the Raha.io Network!
          Joining is and always will be <b>completely free</b>. You must be
          invited by an existing member in person via video using your full name.
          Part of the value of Raha.io Network is that it's a unique identity
          platform. If you sign up a fake identity or have multiple accounts, or invite
          people with fake/duplicate accounts, your account will be frozen. If you know
          of any fake accounts, report them to increase your income level! Ultimate
          decisions of legitimacy will be made by the Raha.io Board.
          Only accept an invite if you trust this member and share similar values, because
          they will be your default admin in the event you need to recover your
          account and default representantive to select your vote for the Raha.io Board. If it turns out
          they invited many fake or duplicate accounts, then your account is at risk of being flagged.
        </div>
>>>>>>> Move invite instructions to Profile.
      </div>
    );
  }

  render() {
    if (this.state.submitted) {
      // TODO this will move into <ProfilePending /> component shown at /me
      return (
        <div>
          Your video has been submitted for review! After approval by us
          and {this.props.toMemberDoc.get('full_name')}, your profile will appear at
          to <a href="https://raha.io/me">https://raha.io/me</a>.
          We are available at <a href="mailto:help@raha.io">help@raha.io</a> if you have any questions.
        </div>
      );
    }
    if (!this.props.notSignedIn && !this.props.isAuthMemberDocLoaded) {
      // TODO the loading appears again breifly is user goes from logged out to signed in with this.renderLogIn()
      return <div>Loading</div>;
    }
    return (
      <div>
<<<<<<< HEAD
        <b>{<FormattedMessage id="request_invite" />}</b>
        <div>
          <FormattedMessage id="invite_me_intro" values={{completely_free: <b><FormattedMessage id="completely_free" /></b>}} />
        </div>
=======
        <b>Request Invite from <i>
          {this.props.isToMemberDocLoaded ? this.props.toMemberDoc.get('full_name') : null} ({this.props.memberId})
        </i></b>
        {this.renderDirections()}
>>>>>>> Move invite instructions to Profile.
        {this.props.notSignedIn ? this.renderLogIn() : (this.props.isAuthLoaded ? this.renderForm() : <div>Loading</div>)}
      </div >
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
