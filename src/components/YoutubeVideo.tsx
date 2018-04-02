import * as classnames from "classnames";
import * as React from "react";

// eslint-disable-next-line no-useless-escape
const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

export function getYoutubeUrlVideoId(url: string) {
  const match = url.match(YOUTUBE_URL_REGEX);
  return match && match[7].length === 11 ? match[7] : false;
}

interface Props {
  readonly youtubeUrl: string;
  readonly className?: string;
}

interface State {
  readonly videoObject: HTMLObjectElement;
  readonly videoEmbed: HTMLEmbedElement;
}

// TODO should load thumbnail so user sees something faster
export default class YoutubeVideo extends React.Component<Props, State> {
  public render() {
    const youtubeId = getYoutubeUrlVideoId(this.props.youtubeUrl);
    // TODO Chrome console errors with this object embed, investigate.
    return (
      <object ref={this.bindVideoObject}>
        <param name="allowFullScreen" value="true" />
        <embed
          className={classnames("YoutubeVideo", this.props.className)}
          ref={this.bindVideoEmbed}
          src={`https://www.youtube.com/embed/${youtubeId}?html5=1&amp;rel=0&amp;version=3`}
        />
      </object>
    );
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.youtubeUrl !== prevProps.youtubeUrl) {
      // This is a hack to make the Youtube video update.
      this.state.videoObject.appendChild(this.state.videoEmbed);
    }
  }

  private readonly bindVideoObject = (elem: HTMLObjectElement | null) => {
    if (elem) {
      this.setState({ videoObject: elem });
    }
  };

  private readonly bindVideoEmbed = (elem: HTMLEmbedElement | null) => {
    if (elem) {
      this.setState({ videoEmbed: elem });
    }
  };
}
