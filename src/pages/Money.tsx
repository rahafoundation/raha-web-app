import Big from "big.js";
import * as React from "react";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import styled from "styled-components";
import { green50, red400 } from "material-ui/styles/colors";

import { trustMember, mint } from "../actions";
import { AppState } from "../store";
import { Username } from "../identifiers";
import { Member, GENESIS_MEMBER } from "../reducers/membersNew";

import Button, { ButtonType, ButtonSize } from "../components/Button";
import Loading from "../components/Loading";
import IntlMessage from "../components/IntlMessage";
import { ApiEndpoint } from "../api";

import { getStatusOfApiCall } from "../selectors/apiCalls";
import { ApiCallStatusType, ApiCallStatus } from "../reducers/apiCalls";
import { getMembersByUid } from "../selectors/members";
import { getMemberMintableAmount } from "../selectors/member";
import { getLoggedInMember } from "../selectors/auth";

import { green } from "../constants/palette";
import { FormattedMessage } from "react-intl";

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
  mintApiCallStatus?: ApiCallStatus;
  memberBalance?: string;
  mintableAmount?: string;
}
interface DispatchProps {
  mint: typeof mint;
}
type MergedProps = StateProps & {
  mint?: () => void;
};

type Props = OwnProps & MergedProps;

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
const ProfileView: React.StatelessComponent<Props> = props => {
  const {
    profileData,
    loggedInMember,
    memberUsername,
    isLoading,
    memberBalance,
    mintableAmount
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
  const mintApiCallStatus = props.mintApiCallStatus
    ? props.mintApiCallStatus.status
    : undefined;

  return (
    <MoneyElem>
      <main>
        <h1>
          <IntlMessage id="money.title" />
        </h1>
        {isLoading && <Loading />}
        {loggedInMember && (
          <section>
            <h2>
              <IntlMessage
                id="money.balance"
                values={{ balance: memberBalance }}
              />
            </h2>
          </section>
        )}
        {loggedInMember &&
          isOwnProfile(loggedInMember, profileMember) &&
          props.mint && (
            <section>
              <h2>
                <IntlMessage id="money.basicIncomeTitle" />
              </h2>
              <p>
                <IntlMessage id="money.basicIncomeDetail" />
              </p>
              <p>
                <FormattedMessage
                  id="money.basicIncomeLastMinted"
                  values={{
                    lastMintedDate: (
                      <b>{loggedInMember.lastMinted.toDateString()}</b>
                    ),
                    lastMintedTime: (
                      <b>{loggedInMember.lastMinted.toTimeString()}</b>
                    )
                  }}
                />
              </p>
              {mintableAmount !== "0" ? (
                <>
                  <p>
                    <FormattedMessage
                      id="money.basicIncomeClickPrompt"
                      values={{
                        mintableAmount: <b>{mintableAmount}</b>
                      }}
                    />
                  </p>
                  {isInviteConfirmed ? (
                    <Button
                      size={ButtonSize.LARGE}
                      type={ButtonType.PRIMARY}
                      onClick={props.mint}
                      disabled={
                        mintApiCallStatus === ApiCallStatusType.STARTED ||
                        mintableAmount === "0"
                      }
                    >
                      {mintApiCallStatus === ApiCallStatusType.STARTED ? (
                        <Loading />
                      ) : (
                        <IntlMessage
                          onlyRenderText={true}
                          id="money.mintButton"
                          values={{
                            mintableAmount
                          }}
                        />
                      )}
                    </Button>
                  ) : (
                    <p>
                      <IntlMessage
                        id="money.basicIncomeInviteConfirmationRequired"
                        className="inviteNotConfirmed"
                      />
                    </p>
                  )}
                </>
              ) : (
                <p>
                  <FormattedMessage id="money.basicIncomeAlreadyClaimed" />
                </p>
              )}
            </section>
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

  const mintApiCallStatus = getStatusOfApiCall(
    state,
    ApiEndpoint.MINT,
    profileMember.uid
  );

  const memberBalance = loggedInMember
    ? loggedInMember.balance.toString()
    : undefined;

  const mintableAmount = loggedInMember
    ? getMemberMintableAmount(state, loggedInMember.uid)
    : undefined;

  // tslint:disable
  console.log(memberBalance);

  return {
    loggedInMember,
    memberUsername,
    isLoading: false,
    profileData: {
      profileMember
    },
    mintApiCallStatus,
    memberBalance,
    mintableAmount
  };
};

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps) => {
  if (!stateProps.profileData) {
    return stateProps;
  }

  const profileUid = stateProps.profileData.profileMember.uid;
  return {
    ...stateProps,
    mint: () => {
      dispatchProps.mint(profileUid, stateProps.mintableAmount);
    }
  };
};

export default connect(mapStateToProps, { mint }, mergeProps)(ProfileView);
