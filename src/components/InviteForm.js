import * as React from 'react';
import * as firebase from 'firebase';
import YoutubeVideo from './YoutubeVideo';
import { FirebaseAuth } from 'react-firebaseui';
import { auth } from '../firebaseInit';

const inviteStateToPendingInvite = (invite: InviteState) => {
  return {
    name: invite.name,
    videoUrl: invite.videoUrl
  }
}

class InviteForm extends React.Component<{}, InviteState> {
    constructor(props: InviteState) {
      super(props);
      this.state = {name: "", videoUrl: "", errorMessage: ""};
    }

    handleOnChange(event: any) : void {
      this.setState({ name: event.target.value });
    }

    setVideoURL(event: any) : void {
      this.setState({ videoUrl: event.target.value })
    }

    isValidEmail(email: string) : boolean {
      return email.indexOf("@gmail.com") != -1;
    }

    handleOnSubmit(event: any) : void {
      event.stopPropagation();

      if (!this.isValidEmail(this.state.name)) {
        this.setState({ errorMessage: "Please enter a valid gmail address" });
      }

      else if (this.state.videoUrl.length <= 0) {
        this.setState({ errorMessage: "Please enter a valid url" });
      }

      else {
        let pendingInvite = inviteStateToPendingInvite(this.state);
        // TODO send ajax, report errors if pendingInvite failed
        console.log(pendingInvite);
      }
    }

    clearErrorMessage(e: any) : void {
      this.setState({ errorMessage: "" });
    }

    render() {
      return (
        <div>
          <b>Invite new users</b>
          <div>The more users join raha, the better! Type in a trusted friend's gmail address to invite them.</div>
          <div>
            <input
              onFocus={ e => this.clearErrorMessage(e) }
              onChange={ e => this.handleOnChange(e) }
              placeholder="Email"
              className="InviteInput"
            />
            <input
              onChange={ e => this.setVideoURL(e) }
              placeholder="VideoUrl"
              className="InviteInput ExtraWidth"
            />           
          </div>
          <button className="InviteButton"
            onClick={ e=> this.handleOnSubmit(e) }>
            Invite { this.state.name.length > 0 ? this.state.name + '!' : ''}
          </button>
          <div className="InviteError">{ this.state.errorMessage }</div>
          <div className="InviteVideoContainer">
            {this.state.videoUrl && <YoutubeVideo youtubeUrl={this.state.videoUrl} />}
          </div>
        </div>
      );
    }
}

export default InviteForm;
