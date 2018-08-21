import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import { AppState } from "../reducers";
import { Member } from "../reducers/membersNew";

interface OwnProps {}
interface StateProps {
  members: Member[];
}
interface DispatchProps {}
type Props = OwnProps & StateProps & DispatchProps;

const LeaderboardElem = styled.main`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const LeaderboardView: React.StatelessComponent<Props> = ({ members }) => {
  members.sort((a, b) => b.get("invited").size - a.get("invited").size);
  return (
    <LeaderboardElem>
      <section>
        <h1>Total members: {members.length}</h1>
      </section>
      <section>
        <h1>Invited count leaderboard</h1>
        <ol>
          {members.map(member => (
            <li key={member.get("memberId")}>
              {member.get("fullName")}: {member.get("invited").size}
            </li>
          ))}
        </ol>
      </section>
    </LeaderboardElem>
  );
};

function mapStateToProps(state: AppState): StateProps {
  return {
    members: Object.values(state.membersNew.byMemberUsername.toObject())
  };
}

export const Leaderboard = connect(mapStateToProps)(LeaderboardView);
