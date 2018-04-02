import React, { Component } from 'react';
import classnames from 'classnames';

// eslint-disable-next-line no-useless-escape
const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

export function getYoutubeUrlVideoId(url: string) {
  const match = url.match(YOUTUBE_URL_REGEX);
  return (match && match[7].length === 11) ? match[7] : false;
};

interface YoutubeVideoProperties {
  youtubeUrl: string;
}

// TODO should load thumbnail so user sees something faster
export default class YoutubeVideo extends Component {
  render() {
    const youtubeId = getYoutubeUrlVideoId(this.props.youtubeUrl);
    // TODO Chrome console errors with this object embed, investigate.
    return (
      <object ref={v => { this.videoObject = v; }} >
        <param name="allowFullScreen" value="true" />
        <embed
          className={classnames("YoutubeVideo", this.props.className)}
          ref={v => { this.videoEmbed = v; }}
          src={`https://www.youtube.com/embed/${youtubeId}?html5=1&amp;rel=0&amp;version=3`}
        />
      </object>
    );
  }

  componentDidUpdate(prevProps: YoutubeVideoProperties, prevState: YoutubeVideoProperties) {
    if (this.props.youtubeUrl !== prevProps.youtubeUrl) {
      // This is a hack to make the Youtube video update.
      this.videoObject.appendChild(this.videoEmbed);
    }
  }
}
