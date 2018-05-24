import Big from "big.js";
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import styled from "styled-components";
import { green50, red400 } from "material-ui/styles/colors";

import { AppState } from "../../store";
import { Username } from "../../identifiers";
import { Member, GENESIS_MEMBER } from "../../reducers/membersNew";

import Button, { ButtonType, ButtonSize } from "../../components/Button";
import IntlMessage from "../../components/IntlMessage";
import Loading from "../../components/Loading";

import { getMembersByUid } from "../../selectors/members";
import { getLoggedInMember } from "../../selectors/auth";

import { green } from "../../constants/palette";

import Balance from "./Balance";
import BasicIncome from "./BasicIncome";
import Give from "./Give";

/* ================
 * Component types
 * ================
 */
interface OwnProps {
  match: { params: { memberUsername: Username } };
}

interface StateProps {
  loggedInMember?: Member;
  isLoading: boolean;
  memberUsername: string;
  profileData?: {
    profileMember: Member;
  };
  memberBalance?: string;
}

type Props = OwnProps & StateProps;

/* =============
 * Data helpers
 * =============
 */
function isOwnProfile(
  loggedInMember: Member | undefined,
  profileMember: Member
): boolean {
  return !!loggedInMember && loggedInMember.uid === profileMember.uid;
}

/**
 * Invite confirmed is defined by satifying one of the following:
 * a) the user was invited as part of the genesis
 * b) the user has been trusted by the person inviting them.
 */
function isInviteConfirmed(profileMember: Member): boolean {
  return (
    profileMember.invitedBy === GENESIS_MEMBER ||
    profileMember.invitedBy in profileMember.trustedBySet
  );
}

/* ==================
 * Styled components
 * ==================
 */

const MoneyElem = styled.main`
  padding: 0 20px;
  margin-bottom: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;

  > main {
    max-width: 768px;

    > section {
      padding: 20px;
      margin: 20px;
      background-color: ${green50};
      border-radius: 2px;
      box-shadow:
        0px 1px 5px 0px rgba(0, 0, 0, 0.2),
        0px 2px 2px 0px rgba(0, 0, 0, 0.14),
        0px 3px 1px -2px rgba(0, 0, 0, 0.12);
    }
  }

  .inviteNotConfirmed {
    text-align: center;
    padding: 10px 20px;
    margin: 0 auto;
    background-color: ${red400};
    color: white;
  }
}
`;

/**
 * Presentational component for displaying profile money interface.
 */
const MoneyView: React.StatelessComponent<Props> = props => {
  const {
    profileData,
    loggedInMember,
    memberUsername,
    isLoading,
    memberBalance
  } = props;
  if (!profileData) {
    return isLoading ? (
      <Loading />
    ) : (
      <IntlMessage id="profile.memberNotFound" values={{ memberUsername }} />
    );
  }
  const { profileMember } = profileData;
  const inviteConfirmed = isInviteConfirmed(profileMember);
  const isLoggedInMembersProfile = isOwnProfile(loggedInMember, profileMember);

  return (
    <MoneyElem>
      <main>
        <h1>
          <IntlMessage id="money.title" />
        </h1>
        {isLoading && <Loading />}
        {memberBalance && <Balance memberBalance={memberBalance} />}
        {loggedInMember &&
          isLoggedInMembersProfile && (
            <BasicIncome
              loggedInMember={loggedInMember}
              inviteConfirmed={inviteConfirmed}
            />
          )}
        {loggedInMember &&
          !isLoggedInMembersProfile && (
            <Give
              loggedInMember={loggedInMember}
              profileMember={profileMember}
            />
          )}
      </main>
    </MoneyElem>
  );
};

/* ================
 * Redux container
 * ================
 */

const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state,
  ownProps
) => {
  const loggedInMember = getLoggedInMember(state);
  const memberUsername = ownProps.match.params.memberUsername;
  const profileMember = state.membersNew.byUsername[memberUsername];
  if (!profileMember) {
    // trust action could not have been initiated if profile never was initialized
    const isLoading = Object.keys(state.membersNew.byUsername).length === 0;
    return { isLoading, loggedInMember, memberUsername };
  }

  const memberBalance = loggedInMember
    ? loggedInMember.balance.toString()
    : undefined;

  return {
    loggedInMember,
    memberUsername,
    isLoading: false,
    profileData: {
      profileMember
    },
    memberBalance
  };
};

export default connect(mapStateToProps)(MoneyView);
