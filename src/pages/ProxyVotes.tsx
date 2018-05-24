import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import IntlMessage from "../components/IntlMessage";
import { AppState } from "../reducers";
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
  display: flex;
  align-items: center;
  flex-direction: column;
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
  membersByUid: MemberLookupTable,
  visited: Set<string> = new Set()
): Set<string> {
  const uid = member.uid;
  if (visited.has(uid)) {
    throw Error(`Found cycle containing member uid ${uid}`);
  }
  visited.add(uid);
  const votingForUid = member.invitedBy; // TODO needs to change to votingFor
  if (votingForUid === GENESIS_MEMBER) {
    // TODO needs to change to check if voting for self
    return visited;
  }
  const votingForMember = membersByUid[votingForUid];
  if (votingForUid === undefined) {
    throw Error(`Cannot vote for invalid uid ${votingForUid}`);
  }
  return getAncestors(votingForMember, membersByUid, visited);
}

function incrementKey(counts: Map<string, number>, key: string) {
  let count = counts.get(key);
  if (count === undefined) {
    count = 0;
  }
  count++;
  counts.set(key, count);
}

function incVotesForAncestors(
  member: Member,
  membersByUid: MemberLookupTable,
  votesByUid: Map<string, number>
) {
  const ancestors = getAncestors(member, membersByUid);
  ancestors.forEach(a => incrementKey(votesByUid, a));
}

function getVotesByUid(membersByUid: MemberLookupTable) {
  const votesByUid = new Map();
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
