import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import { IntlMessage } from "../components/IntlMessage";
import { AppState } from "../reducers";
import { Uid } from "../identifiers";
import { Member, GENESIS_MEMBER } from "../reducers/membersNew";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { Map } from "immutable";

interface Props {
  memberAndVotes: [[Member, number]];
}

const ProxyVotesElem = styled.main`
  max-width: 90vw;
`;

// TODO these should be nice thumbnails presented in a component also used by Leaderboard.tsx
const ProxyVotesView: React.StatelessComponent<Props> = ({
  memberAndVotes
}) => {
  return (
    <ProxyVotesElem>
      <section>
        <IntlMessage id="votes.votes" tagName="h1" />
        <IntlMessage id="votes.heading" tagName="p" />
        <ol>
          {memberAndVotes.map(memberAndVote => {
            const [member, votes] = memberAndVote;
            return (
              <li key={member.get("memberId")}>
                {member.get("fullName")}: {votes}
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
  membersByUid: Map<MemberId, Member>
): Set<Uid> {
  // Everyone is their own ancestor in this function
  let votingForMember: Member | undefined = member;
  const ancestors = new Set<Uid>();
  for (
    let votingForUid: MemberId | undefined | typeof GENESIS_MEMBER = member.get(
      "memberId"
    );
    !!votingForUid && votingForUid !== GENESIS_MEMBER; // TODO needs to change to check if voting for self
    votingForUid = votingForMember.get("invitedBy") // TODO needs to change to votingFor
  ) {
    votingForMember = membersByUid.get(votingForUid);
    if (votingForMember === undefined) {
      throw Error(`Cannot vote for invalid uid ${votingForUid}`);
    }
    if (ancestors.has(votingForUid)) {
      throw Error(
        `Cycle in ancestors of ${member.get(
          "memberId"
        )}: ${votingForUid} found twice`
      );
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
  membersByUid: Map<string, Member>,
  votesByUid: Map<string, number>
) {
  const ancestors = getAncestors(member, membersByUid);
  ancestors.forEach(a => incrementKey(votesByUid, a));
}

function getVotesByUid(membersByUid: Map<MemberId, Member>) {
  const votesByUid = Map<MemberId, number>();
  for (const m of membersByUid.values()) {
    incVotesForAncestors(m, membersByUid, votesByUid);
  }
  return votesByUid;
}

function mapStateToProps(state: AppState): Props {
  const membersByUid = state.membersNew.byMemberId;
  const votesByUid = getVotesByUid(membersByUid);
  const memberAndVotes = Array.from(votesByUid, uidAndVote => [
    membersByUid.get(uidAndVote[0]),
    uidAndVote[1]
  ]) as [[Member, number]];
  memberAndVotes.sort((a, b) => b[1] - a[1]);
  return { memberAndVotes };
}

export const ProxyVotes = connect(mapStateToProps)(ProxyVotesView);
