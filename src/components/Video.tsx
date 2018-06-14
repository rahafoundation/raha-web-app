import * as React from "react";
import styled from "styled-components";

const VideoElem = styled.video`
  max-width: 90vw;
  width: 600px;
  height: 400px;
  display: block;
`;

interface Props {
  videoUrl: string;
  className?: string;
}

const Video: React.StatelessComponent<Props> = ({ videoUrl, className }) => {
  return (
    <VideoElem
      className={className}
      controls={true}
      controlsList="nodownload"
      src={videoUrl}
    />
  );
};

export { Video }
