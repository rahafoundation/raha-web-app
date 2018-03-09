import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getRequestInviteOperation } from '../operations';
import { getMemberId } from '../members';
import { postOperation, fetchMemberByUidIfNeeded } from '../actions';
import YoutubeVideo from './YoutubeVideo';
import LogIn from './LogIn';

export class RequestInviteForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoUrl: "",
      toUid: "",
      errorMessage: "",
      fullName: props.fullName,
      nameEdited: false
    };
  }

  setVideoURL = async (event: any): void => {
    this.setState({ videoUrl: event.target.value })
  }

  setToUid = async (event: any): void => {
    this.setState({ toUid: event.target.value })
    this.props.fetchMemberByUidIfNeeded(event.target.value);
  }

  setFullName = async (event: any): void => {
    this.setState({ fullName: event.target.value });
  }

  handleOnSubmit = async (event: any): void => {
    event.stopPropagation();

    if (this.state.videoUrl.length <= 0) {
      this.setState({ errorMessage: "Please enter a valid video url" });
    }

    else if (this.state.toUid.length <= 0 || !this.props.members[this.state.toUid]) {
      this.setState({ errorMessage: "Please enter a valid friend's uid" });
    }

    else {
      let toUid = this.state.toUid;
      let toMid = this.props.members[toUid].doc.get("mid");
      let fullName = this.state.fullName;
      let creatorMid = getMemberId(fullName);
      let videoUrl = this.state.videoUrl;

      let requestOp = getRequestInviteOperation(toUid, toMid, creatorMid, fullName, videoUrl);
      await this.props.postOperation(requestOp);
    }
  }

  componentWillReceiveProps(nextProps) {
    const fullName = nextProps.fullName;
    if (fullName !== this.props.fullName) {
      this.setState({ fullName });
    }
  }

  clearErrorMessage(e: any): void {
    this.setState({ errorMessage: "" });
  }

  renderLogIn() {
    return (
      <div>
        <LogIn noRedirect />
        <div>Sign up above to continue :)</div>
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
            onChange={this.setToUid}
            placeholder="Invite member id"
            className="InviteInput UidInput"
          />
        </div>
        <div>
          <input
            onChange={this.setVideoURL}
            placeholder="Invite video url"
            className="InviteInput VideoUrlInput"
          />
        </div>
        <button className="InviteButton Green"
          onClick={this.handleOnSubmit}>
          Invite me!
        </button>
        <div className="InviteError">{this.state.errorMessage}</div>
        <div className="InviteVideoContainer">
          {this.state.videoUrl && <YoutubeVideo youtubeUrl={this.state.videoUrl} />}
        </div>
      </div>
    );
  }

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
      </div>
    );
  }

  render() {
    if (!this.props.isAuthLoaded) {
      return <div>Loading</div>;
    }
    return (
      <div>
        <b>Request Invite</b>
        {this.renderDirections()}
        {this.props.notSignedIn ? this.renderLogIn() : this.renderForm()}
      </div >
    );
  }
}

function mapStateToProps(state, ownProps) {
  const isAuthLoaded = state.auth.isLoaded;
  if (!isAuthLoaded) {
    return { isAuthLoaded }
  }
  if (!state.auth.firebaseUser) {
    return { isAuthLoaded, notSignedIn: true }
  }
  return {
    isAuthLoaded,
    fullName: state.auth.firebaseUser.displayName,
    members: state.uidToMembers
  };
}

export default connect(mapStateToProps, { postOperation, fetchMemberByUidIfNeeded })(RequestInviteForm);
