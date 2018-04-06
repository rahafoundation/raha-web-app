import randomColor from "random-material-color";
import * as React from "react";
import { connect } from "react-redux";
import styled, { ThemeProvider } from "styled-components";
import Link from "../../components/Link";

import { fetchMemberByUidIfNeeded } from "../../actions";
import { interactive, gray, lightGreen } from "../../constants/palette";
import { OpMeta } from "../../operations";
import { AppState } from "../../store";

const Loading = () => {
  return <div>Loading</div>;
};

interface OwnProps {
  uid: string;
  opMeta: OpMeta;
}
interface PropsFromAppState {
  memberDoc?: firebase.firestore.DocumentData;
}
interface PropsFromDispatch {
  fetchMemberByUidIfNeeded: typeof fetchMemberByUidIfNeeded;
}
type Props = OwnProps & PropsFromAppState & PropsFromDispatch;

// TODO generalize some of these styles into a link type
const MemberThumbnailElem = styled(Link)`
  display: flex;
  width: 200px;
  align-items: center;
  justify-content: flex-start;
  border-radius: 3px;
  transition: background-color 0.05s, color 0.05s;

  :hover,
  :focus,
  :active {
    background: ${interactive.primary};
    color: white;
  }

  > * {
    margin: 0.25rem;
  }

  /* custom behavior to handle underline properly with initials display */
  :hover,
  :active,
  :focus {
    text-decoration: none;
  }

  > .thumbnailImage {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 50px;
    height: 50px;
    border-radius: 3px;

    background: ${props => props.theme.thumbnailBackgroundColor};
    color: white;
    font-size: 1.3rem;
  }
`;
MemberThumbnailElem.defaultProps = {
  theme: {
    thumbnailBackgroundColor: lightGreen
  }
};

// TODO(#14) improve this thumbnail
class MemberThumbnail extends React.Component<Props> {
  public componentDidMount() {
    this.props.fetchMemberByUidIfNeeded(this.props.uid);
  }

  public render() {
    const memberDoc = this.props.memberDoc && this.props.memberDoc.memberDoc;
    if (!memberDoc) {
      return (
        <div className="MemberThumbnail">
          <Loading />
        </div>
      );
    }
    const mid = memberDoc.get("mid");
    const name: string | null = memberDoc.get("full_name");
    // TODO: why is name sometimes undefined?
    // TODO: better algorithm for determining initials of names with dashes,
    // limiting number of characters, etc...
    const initials =
      name &&
      name
        .split(" ")
        .map(part => part.charAt(0))
        .join("")
        .toUpperCase();
    const backgroundColor = randomColor.getColor({ text: `${mid}${initials}` });
    return (
      <ThemeProvider theme={{ thumbnailBackgroundColor: backgroundColor }}>
        <MemberThumbnailElem
          color={this.props.opMeta.inDb ? undefined : gray}
          to={`/m/${mid}`}
        >
          {/* TODO: if thumbnail image exists, show that instead of initials */}
          <span className="thumbnailImage">{initials}</span>
          <span className="memberName">{name}</span>
        </MemberThumbnailElem>
      </ThemeProvider>
    );
  }
}

function mapStateToProps(
  state: AppState,
  ownProps: OwnProps
): PropsFromAppState {
  return { memberDoc: state.members.byUid[ownProps.uid] };
}

export default connect(mapStateToProps, { fetchMemberByUidIfNeeded })(
  MemberThumbnail
);
