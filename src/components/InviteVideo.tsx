import * as classnames from "classnames";
import * as React from "react";
import { getInviteVideoStorageRef } from "../connectors";
import { storageRef } from '../firebaseInit';
import Loading from './Loading';

interface Props {
  readonly userId: string;
  readonly className?: string;
}

interface State {
  videoUrl: string;
}

// TODO should load thumbnail so user sees something faster
export default class InviteVideo extends React.Component<Props, State> {
  public state = {videoUrl: ''}

  public async componentDidMount() {
    const videoUrl = await getInviteVideoStorageRef(storageRef, this.props.userId).getDownloadURL();
    this.setState({ videoUrl });
  }

  public render() {
    if (!this.state.videoUrl) {
      return <Loading />;
    }
    // TODO Chrome console errors with this object embed, investigate.
    return (
      // TODO poster="posterimage.jpg" - would be great if our async function handled this.
      <div>
        <video controls={true} controlsList="nodownload" className={this.props.className} src={this.state.videoUrl} />
      </div>
    );
  }
}
