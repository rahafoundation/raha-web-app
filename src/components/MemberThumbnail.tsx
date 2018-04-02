import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from './Link';
import styled from 'styled-components';
import randomColor from 'random-material-color';
import { interactive } from '../constants/palette';

import { gray } from '../constants/palette';
import { fetchMemberByUidIfNeeded, OpMeta } from '../actions';

const Loading = () => {
  return <div>Loading</div>;
};

interface Props {
  uid: string;
  opMeta: OpMeta;
  memberDoc?: firebase.firestore.DocumentData;
}

// TODO generalize some of these styles into a link type
const MemberThumbnailElem = styled(Link)`
  display: flex;
  width: 200px;
  align-items: center;
  justify-content: flex-start;
  border-radius: 3px;
  transition: background-color .05s, color .05s;

  :hover, :focus, :active {
    background: ${interactive.primary};
    color: white;
  }

  > * {
    margin: .25rem;
  }

  /* custom behavior to handle underline properly with initials display */
  :hover, :active, :focus {
    text-decoration: none;
  }

  > .thumbnailImage {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 50px;
    height: 50px;
    border-radius: 3px;

    background: ${props => props.thumbnailBackgroundColor};
    color: white;
    font-size: 1.3rem;
  }
`;

// TODO(#14) improve this thumbnail
class MemberThumbnail extends Component<Props> {
  componentDidMount() {
    this.props.fetchMemberByUidIfNeeded(this.props.uid);
  }

  render() {
    const memberDoc = this.props.memberDoc && this.props.memberDoc.memberDoc;
    if (!memberDoc) {
      return <div className="MemberThumbnail"><Loading /></div>;
    }
    const mid = memberDoc.get('mid');
    const name = memberDoc.get('full_name');
    // TODO: why is name sometimes undefined?
    // TODO: better algorithm for determining initials of names with dashes,
    // limiting number of characters, etc...
    const initials = name && name
      .split(' ').map(part => part.charAt(0)).join('').toUpperCase();
    const backgroundColor = randomColor.getColor({ text: `${mid}${initials}` });
    return (
      <MemberThumbnailElem
        color={this.props.opMeta.inDb ? undefined : gray}
        to={`/m/${mid}`}
        thumbnailBackgroundColor={backgroundColor}
      >
        { /* TODO: if thumbnail image exists, show that instead of initials */ }
        <span className="thumbnailImage">{initials}</span>
        <span className="memberName">{name}</span>
      </MemberThumbnailElem>
    );
  }
}

export default connect(
  (state, ownProps) => {
    return { memberDoc: state.members.byUid[ownProps.uid] };
  },
  {
    fetchMemberByUidIfNeeded
  }
)(MemberThumbnail);
