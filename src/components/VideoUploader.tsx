import * as React from "react";
import * as firebase from "firebase";
import Button, { ButtonType } from "./Button";
import styled from "styled-components";
import IntlMessage from "./IntlMessage";

const BYTES_PER_MIB = 1024 * 1024;
const MAX_VIDEO_SIZE = 60 * BYTES_PER_MIB;

interface Props {
  uploadRef: firebase.storage.Reference;
  setVideoUrl: (url: string | null) => void;
}

interface State {
  errorMessage?: string;
  uploading: boolean;
  uploaded: boolean;
  uploadedBytes: number;
  totalBytes: number;
}

interface HTMLInputEvent extends React.FormEvent<HTMLInputElement> {
  target: HTMLInputElement & EventTarget;
}

const VideoUploaderElem = styled.div`
  > form {
    > *:not(:last-child) {
      margin-bottom: 20px;
    }
    > label {
      display: block;
    }
  }
`;
export default class VideoUploader extends React.Component<Props, State> {
  private uploadVideoInput?: HTMLInputElement | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      uploading: false,
      uploaded: false,
      uploadedBytes: 0,
      totalBytes: 0
    };
  }

  private uploadInviteVideo = async (event: HTMLInputEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.target.files === null) {
      this.setState({ errorMessage: "Invalid video file" });
      return;
    }
    const file = event.target.files[0];

    if (file.size > MAX_VIDEO_SIZE) {
      this.setState({
        errorMessage: "Video is larger than 40 MB, please upload smaller video."
      });
      return;
    }

    const metadata = {
      contentType: file.type
    };

    this.setState({ uploading: true });
    const uploadTask = this.props.uploadRef.put(file, metadata);
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      s => {
        const snapshot = s as firebase.storage.UploadTaskSnapshot;
        this.setState({
          uploadedBytes: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes
        });
      },
      () => this.setState({ errorMessage: "Could not upload" }),
      () => {
        this.setState({ uploading: false });
        this.props.setVideoUrl(uploadTask.snapshot.downloadURL);
      }
    );
  };

  public render() {
    return (
      <VideoUploaderElem>
        <label>
          <IntlMessage id="upload_invite" tagName="div" />
          <input
            ref={elem => (this.uploadVideoInput = elem)}
            onChange={this.uploadInviteVideo}
            id="inviteVideo"
            capture={true}
            accept="video/mp4"
            type="file"
            style={{ display: "none" }}
          />
        </label>

        <Button
          onClick={() => this.uploadVideoInput && this.uploadVideoInput.click()}
          type={ButtonType.PRIMARY}
        >
          Upload Your Video
        </Button>
        {this.state.uploading && (
          <div>
            Uploaded{" "}
            {Math.round(
              100.0 * this.state.uploadedBytes / this.state.totalBytes
            )}%
          </div>
        )}
        <div className="InviteError">{this.state.errorMessage}</div>
      </VideoUploaderElem>
    );
  }
}
