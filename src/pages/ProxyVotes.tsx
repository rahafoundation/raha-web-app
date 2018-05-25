import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import IntlMessage from "../components/IntlMessage";
import { AppState } from "../reducers";
import { Uid } from "../identifiers";
import {
  Member,
  MemberLookupTable,
  GENESIS_MEMBER
} from "../reducers/membersNew";

interface OwnProps {}
interface StateProps {
  members: Member[];
}
interface DispatchProps {}
interface Props {
  memberAndVotes: [[Member, number]];
}

const ProxyVotesElem = styled.main`
  max-width: 90vw;
`;

// TODO these should be nice thumbnails presented in a component also used by Leaderboard.tsx
const ProxyVotes: React.StatelessComponent<Props> = ({ memberAndVotes }) => {
  return (
    <ProxyVotesElem>
      <section>
        <IntlMessage id="votes.votes" tagName="h1" />
        <IntlMessage id="votes.heading" tagName="p" />
        <ol>
          {memberAndVotes.map(memberAndVote => {
            const [member, votes] = memberAndVote;
            return (
              <li key={member.uid}>
                {member.fullName}: {votes}
              </li>
            );
          })}
        </ol>
      </section>
    </ProxyVotesElem>
  );
};

function getAncestors(
  member: Member,
  membersByUid: MemberLookupTable
): Set<Uid> {
  // Everyone is their own ancestor in this function
  let votingForMember = member;
  const ancestors = new Set<Uid>();
  for (
    let votingForUid: Uid | typeof GENESIS_MEMBER = votingForMember.uid;
    votingForUid !== GENESIS_MEMBER; // TODO needs to change to check if voting for self
    votingForUid = votingForMember.invitedBy  // TODO needs to change to votingFor
  ) {
    votingForMember = membersByUid[votingForUid];
    if (votingForMember === undefined) {
      throw Error(`Cannot vote for invalid uid ${votingForUid}`);
    }
    if (ancestors.has(votingForUid)) {
      throw Error(`Cycle in ancestors of ${member.uid}: ${votingForUid} found twice`);
    }
    ancestors.add(votingForUid);
  }
  return ancestors;
}

function incrementKey(counts: Map<any, number>, key: any) {
  const count = counts.get(key);
  counts.set(key, count === undefined ? 1 : count + 1);
}

function incVotesForAncestors(
  member: Member,
  membersByUid: MemberLookupTable,
  votesByUid: Map<Uid, number>
) {
  const ancestors = getAncestors(member, membersByUid);
  ancestors.forEach(a => incrementKey(votesByUid, a));
}

function getVotesByUid(membersByUid: MemberLookupTable) {
  const votesByUid = new Map<Uid, number>();
  Object.values(membersByUid).forEach(m =>
    incVotesForAncestors(m, membersByUid, votesByUid)
  );
  return votesByUid;
}

function mapStateToProps(state: AppState): Props {
  const membersByUid = state.membersNew.byUid;
  const votesByUid = getVotesByUid(membersByUid);
  const memberAndVotes = Array.from(votesByUid, uidAndVote => [
    membersByUid[uidAndVote[0]],
    uidAndVote[1]
  ]) as [[Member, number]];
  memberAndVotes.sort((a, b) => b[1] - a[1]);
  return { memberAndVotes };
}

export default connect(mapStateToProps)(ProxyVotes);
