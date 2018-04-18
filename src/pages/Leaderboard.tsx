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

const Leaderboard: React.StatelessComponent<Props> = ({ members }) => {
  members
    .sort(
      (a, b) =>
        Object.values(a.invitedSet).length - Object.values(b.invitedSet).length
    )
    .reverse();
  return (
    <LeaderboardElem>
      <section>
        <h1>Total members: {members.length}</h1>
      </section>
      <section>
        <h1>Invited count leaderboard</h1>
        <ol>
          {members.map(member => (
            <li key={member.uid}>
              {member.fullName}: {Object.values(member.invitedSet).length}
            </li>
          ))}
        </ol>
      </section>
    </LeaderboardElem>
  );
};

function mapStateToProps(state: AppState): StateProps {
  return { members: Object.values(state.membersNew.byMid) };
}

export default connect(mapStateToProps)(Leaderboard);
