import * as React from 'react';

const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

const getYoutubeUrlVideoId = (url: string) => {
  const match = url.match(YOUTUBE_URL_REGEX);
  return (match && match[7].length === 11) ? match[7] : false;
};

interface YoutubeVideoProperties {
  youtubeUrl: string;
}

export default class YoutubeVideo extends React.Component<YoutubeVideoProperties, {}> {
  private videoObject: HTMLObjectElement;
  private videoEmbed: HTMLEmbedElement;

  render() {
    const youtubeId = getYoutubeUrlVideoId(this.props.youtubeUrl);
    // TODO Chrome console errors with this object embed, investigate.
    return (
      <div className="Video">
        <object ref={v => { this.videoObject = v; }} >
          <div>Join Video</div>
          <param name="allowFullScreen" value="true" />
          <embed
            className="Youtube"
            ref={v => { this.videoEmbed = v; }}
            src={`https://www.youtube.com/embed/${youtubeId}?html5=1&amp;rel=0&amp;version=3`}
          />
        </object>
      </div>
    );
  }

  componentDidUpdate(prevProps: YoutubeVideoProperties, prevState: YoutubeVideoProperties) {
    if (this.props.youtubeUrl !== prevProps.youtubeUrl) {
      // This is a hack to make the Youtube video update.
      this.videoObject.appendChild(this.videoEmbed);
    }
  }
}
