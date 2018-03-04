import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getAuthMemberData } from '../connectors';
import { getRequestInviteOperation } from '../operations';
import { postOperation } from '../actions';
import YoutubeVideo from './YoutubeVideo';

interface Props {
  toUid: string;
  toMid: string;
  fullName: string;
  videoUrl: string;
}

class RequestInviteForm extends Component<Props> {
    constructor(props: InviteState) {
      super(props);
      this.state = {fullName: "", videoUrl: "", errorMessage: ""};
    }

    setFullName(event: any) : void {
      this.setState({ fullName: event.target.value })
    }

    setVideoURL(event: any) : void {
      this.setState({ videoUrl: event.target.value })
    }

    handleOnSubmit(event: any) : void {
      event.stopPropagation();

      if (this.state.fullName.length <= 0) {
        this.setState({ errorMessage: "Please enter you name" });
      }

      else if (this.state.videoUrl.length <= 0) {
        this.setState({ errorMessage: "Please enter a valid url" });
      }

      else {
        let requestOp = getRequestInviteOperation(
          this.props.toUid,
          this.props.toMid,
          this.props.authMemberData.id,
          this.props.authMemberData.get('mid'),
          this.state.fullName,
          this.state.videoUrl
        );
        this.props.postOperation(requestOp);
      }
    }

    clearErrorMessage(e: any) : void {
      this.setState({ errorMessage: "" });
    }

    render() {
      return (
        <div>
          <b>Invite new users</b>
          <div>The more users join raha, the better! Type in a trusted friends gmail address to invite them.</div>
          <div>
            <input
              onChange={ e => this.setFullName(e) }
              placeholder="Your full name (e.g. John Doe)"
              className="InviteInput ExtraWidth"
            />           
          </div>
          <div>
            <input
              onChange={ e => this.setVideoURL(e) }
              placeholder="VideoUrl"
              className="InviteInput ExtraWidth"
            />           
          </div>
          <button className="InviteButton"
            onClick={ e=> this.handleOnSubmit(e) }>
            Invite me!
          </button>
          <div className="InviteError">{ this.state.errorMessage }</div>
          <div className="InviteVideoContainer">
            {this.state.videoUrl && <YoutubeVideo youtubeUrl={this.state.videoUrl} />}
          </div>
        </div>
      );
    }
}

function mapStateToProps(state) {
  return { authMemberData: getAuthMemberData(state) };
}

export default connect(mapStateToProps, { postOperation })(RequestInviteForm);
