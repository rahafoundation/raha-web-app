import * as React from "react";
import Video from "./Video";

interface Props {
  readonly memberUid: string;
  readonly className?: string;
}

const InviteVideo: React.StatelessComponent<Props> = ({
  memberUid,
  className
}) => {
  // TODO group by uid instead of username
  const videoUrl = `https://storage.googleapis.com/raha-video/${memberUid}/invite.mp4`;
  return <Video className={className} videoUrl={videoUrl} />;
};
export default InviteVideo;
