import * as React from 'react';
import styled from "styled-components";

import MemberList from "./MemberList";

import { green, interactive } from "../../constants/palette";

import { Member, GENESIS_USER } from "../../reducers/membersNew"

/* ================
 * Component types
 * ================
 */

interface Props {
  trustedMembers: Member[];
  trustedByMembers: Member[];
  invitedMembers: Member[];
  invitedByMember: Member | typeof GENESIS_USER;
}

/* ==================
 * Styled components
 * ==================
 */

const MemberRelationsElem = styled.section`
  display: flex;
  flex-wrap: wrap;
  > * {
    flex-basis: 40%;
    flex-grow: 1;
    margin: 10px;
  }
`;

/**
 * Presentational component for displaying a relationships between
 * a member and immediate connections in the social graph.
 */
const MemberRelations: React.StatelessComponent<Props> =
  ({ invitedByMember, invitedMembers, trustedByMembers, trustedMembers }) => {
    const sections = {
      ...{
        invited: invitedMembers,
        trusted_by: trustedByMembers,
        trusts: trustedMembers
      },
      // only show invited by section if not part of the genesis, i.e. someone
      // invited you.
      // TODO: handle the Invited By section differently than the rest, since
      // it is a different sort of data—a single, invited member, not a list of
      // them.
      ...(invitedByMember === GENESIS_USER ? {} : {
        invited_by: [invitedByMember]
      })
    }

    const renderedSections = (Object.keys(
      sections
    ) as Array<keyof typeof sections>).map(titleId => (
      <MemberList
        key={titleId}
        titleId={titleId}
        members={sections[titleId]}
      />
    ));
    return <MemberRelationsElem>{renderedSections}</MemberRelationsElem>;

  }

export default MemberRelations;
