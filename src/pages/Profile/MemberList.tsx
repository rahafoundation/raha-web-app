import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faHandPeace,
  faHandshake,
  faEnvelopeOpen
} from "@fortawesome/free-regular-svg-icons";

import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { green, interactive } from "../../constants/palette";

import { Member } from "../../reducers/membersNew";

import MemberThumbnail from "./MemberThumbnail";

/* ==========
 * Constants
 * ==========
 */
const MEMBER_LIST_ICONS = {
  trusted_by: faHandPeace,
  trusts: faHandshake,
  invited: faEnvelope,
  invited_by: faEnvelopeOpen
};

/* =============
 * Data helpers
 * =============
 */

// TODO: handle via react-intl
function pluralizeRemainingMembers(numRemaining: number) {
  if (numRemaining === 0) {
    return "";
  }

  if (numRemaining === 1) {
    return "and one more member";
  }

  return `and ${numRemaining} more members`;
}

/* ================
 * Component types
 * ================
 */
type MemberListTitleId = keyof typeof MEMBER_LIST_ICONS;

interface MemberListProps {
  titleId: MemberListTitleId;
  members: Member[];
}

interface MemberListState {
  expanded: boolean;
}

/********************
 * Styled components
 ********************
 */

const MemberListElem = styled.div`
  max-width: "600px";
  background: #f4f4f4;
  border: #efefef;
  border-radius: 3px;

  > header {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;

    background: ${green};
    color: white;
    padding: 10px;
    margin-bottom: 10px;

    > .relationIcon {
      font-size: 1.5rem;
      margin-right: 10px;
    }

    &:focus ~ .members {
      display: block;
    }

    > .numMembers {
      font-weight: bold;
    }
  }

  > main {
    padding: 10px;
    text-align: center;
  }

  > footer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-bottom: 20px;
    padding-right: 10px;

    /* TODO: make this a general purpose button style */
    .expandBtn {
      background: none;
      border: none;
      font-size: 1rem;
      font-weight: bold;
      color: ${interactive.secondary};
      cursor: pointer;
      text-decoration: underline;

      :hover,
      :active,
      :focus {
        color: ${interactive.secondaryHover};
      }
    }
  }
`;

const Members = styled.ul`
  padding: 0;
  margin: 0;
  list-style-type: none;
  text-align: left;

  > li {
    display: inline-block;
    margin: 0.25rem;
  }
`;

const ExpandedMemberListElem = MemberListElem.extend`
  max-width: none;
`;

/**
 * Presentational component for viewing a list of users.
 */
class MemberList extends React.Component<MemberListProps, MemberListState> {
  constructor(props: MemberListProps) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  public handleExpand(expanded: boolean) {
    return () => {
      this.setState({ expanded });
    };
  }

  public render() {
    const { titleId, members } = this.props;
    const { expanded } = this.state;

    const INITIAL_LIST_SIZE = 4;

    const memberThumbnails = members.map(member => (
      <li key={member.uid}>
        <MemberThumbnail member={member} />
      </li>
    ));

    const numRemainingMembers = Math.max(
      memberThumbnails.length - INITIAL_LIST_SIZE,
      0
    );
    const TopLevelElem = expanded ? ExpandedMemberListElem : MemberListElem;

    return (
      <TopLevelElem key={titleId}>
        <header>
          <FontAwesomeIcon
            className="relationIcon"
            icon={MEMBER_LIST_ICONS[titleId]}
          />
          <span className="messageTitle">
            <FormattedMessage id={titleId} />
          </span>&nbsp;
        </header>
        <main>
          {memberThumbnails.length === 0 && <span>No other members yet</span>}
          <Members>
            {expanded
              ? memberThumbnails
              : memberThumbnails.slice(0, INITIAL_LIST_SIZE)}
          </Members>
        </main>

        <footer>
          {numRemainingMembers > 0 && (
            <button
              className="expandBtn"
              onClick={this.handleExpand(!expanded)}
            >
              {expanded
                ? "Hide full list"
                : pluralizeRemainingMembers(numRemainingMembers)}
            </button>
          )}
        </footer>
      </TopLevelElem>
    );
  }
}
export default MemberList;
