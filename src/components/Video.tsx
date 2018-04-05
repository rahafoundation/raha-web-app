import * as React from "react";
import styled from "styled-components";


const VideoElem = styled.div`
  video {
    max-width: 90vw;
    width: 600px;
    height: 400px;
  }
`;

export default class Video extends React.Component<{ videoUrl: string }, {}> {
  // TODO poster="thumbnail.jpg"
  public render() {
    return (
      <VideoElem>
        <video controls={true} controlsList="nodownload" src={this.props.videoUrl} />
      </VideoElem>
    )
  }
}