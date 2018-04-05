import * as classnames from "classnames";
import * as React from "react";
import { getPrivateVideoInviteRef } from "../connectors";
import { storageRef } from "../firebaseInit";
import Loading from "./Loading";
import Video from "./Video";

interface Props {
  readonly userId: string;
  readonly memberId: string;
}

export default class InviteVideo extends React.Component<Props, {}> {
  public render() {
    // TODO group by uid instead of mid?
    const videoUrl = `https://storage.googleapis.com/raha-video/${this.props.memberId}/invite.mp4`
    return (
      <div>
        <Video videoUrl={videoUrl} />
      </div>
    );
  }
}
