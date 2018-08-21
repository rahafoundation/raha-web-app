import * as React from "react";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";
import styled from "styled-components";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

import { trustMember } from "../../actions";
import { AppState } from "../../store";
import { Username } from "../../identifiers";
import { Member, GENESIS_MEMBER } from "../../reducers/membersNew";
import { MemberRelations } from "./MemberRelations";

import { Button, ButtonType, ButtonSize } from "../../components/Button";
import { Loading } from "../../components/Loading";
import { IdentityLevel } from "../../components/IdentityLevel";
import { InviteVideo } from "../../components/InviteVideo";
import { IntlMessage } from "../../components/IntlMessage";

import { getStatusOfApiCall } from "../../selectors/apiCalls";
import { ApiCallStatusType, ApiCallStatus } from "../../reducers/apiCalls";
import { getMembersByUid } from "../../selectors/members";
import { getLoggedInMember } from "../../selectors/auth";

import { green } from "../../constants/palette";

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
    trustedMembers: Member[];
    trustedByMembers: Member[];
    invitedMembers: Member[];
    invitedByMember: Member | typeof GENESIS_MEMBER;
  };
  trustApiCallStatus?: ApiCallStatus;
}
interface DispatchProps {
  trustMember: typeof trustMember;
}
type MergedProps = StateProps & {
  trust?: () => void;
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
  return (
    !!loggedInMember &&
    loggedInMember.get("memberId") === profileMember.get("memberId")
  );
}

function trustsMember(
  loggedInMember: Member | undefined,
  toTrust: Member
): boolean {
  return (
    !!loggedInMember &&
    loggedInMember.get("trusts").includes(toTrust.get("memberId"))
  );
}

function canTrustMember(
  loggedInMember: Member | undefined,
  toTrust: Member
): boolean {
  return (
    !!loggedInMember &&
    !isOwnProfile(loggedInMember, toTrust) &&
    !trustsMember(loggedInMember, toTrust)
  );
}

/* ==================
 * Styled components
 * ==================
 */

const ProfileElem = styled.main`
  padding: 0 20px;
  > header {
    margin-bottom: 20px;

    > .memberTitle {
      display: flex;
      align-items: center;

      > * {
        margin-left: 20px;
      }

      > .trustApiFailure,
      .trustApiSuccess {
        font-size: 1rem;
        font-weight: 400;
      }
      > .trustApiSuccess {
        color: ${green};
      }
      > .trustApiFailure {
        color: red;
      }
    }

    > .memberSubtitle {
      display: flex;
      align-items: center;

      > * {
        margin-left: 20px;
      }
    }
  }
`;

type WalletButtonProps = RouteComponentProps<any> & {
  walletLink: string;
};
const WalletButton: React.StatelessComponent<WalletButtonProps> = props => (
  <Button
    type={ButtonType.PRIMARY}
    onClick={() => {
      props.history.push(props.walletLink);
    }}
  >
    <IntlMessage id="profile.viewWallet" />
  </Button>
);
const WalletButtonLink = withRouter(WalletButton);

/**
 * Presentational component for displaying a profile.
 */
const ProfileView: React.StatelessComponent<Props> = props => {
  const { profileData, loggedInMember, memberUsername, isLoading } = props;
  if (!profileData) {
    return isLoading ? (
      <Loading />
    ) : (
      <IntlMessage id="profile.memberNotFound" values={{ memberUsername }} />
    );
  }
  const {
    profileMember,
    trustedByMembers,
    trustedMembers,
    invitedByMember,
    invitedMembers
  } = profileData;
  const inviteConfirmed = profileMember.get("inviteConfirmed");
  const trustApiCallStatus = props.trustApiCallStatus
    ? props.trustApiCallStatus.status
    : undefined;

  return (
    <ProfileElem>
      <header>
        <h1 className="memberTitle">
          {profileMember.get("fullName")}

          {props.trust &&
            canTrustMember(loggedInMember, profileMember) && (
              <Button
                className="trustButton"
                size={ButtonSize.LARGE}
                type={ButtonType.PRIMARY}
                onClick={props.trust}
                disabled={trustApiCallStatus === ApiCallStatusType.STARTED}
              >
                {trustApiCallStatus === ApiCallStatusType.STARTED ? (
                  <Loading />
                ) : (
                  <IntlMessage onlyRenderText={true} id="profile.trustButton" />
                )}
              </Button>
            )}
          {trustsMember(loggedInMember, profileMember) && (
            <IntlMessage
              className="trustApiSuccess"
              id="profile.trustedMember"
            />
          )}
          {trustApiCallStatus === ApiCallStatusType.FAILURE && (
            <IntlMessage
              className="trustApiFailure"
              id="profile.trustFailure"
            />
          )}
        </h1>
        <div className="memberSubtitle">
          {/* TODO: This component looks like it has extraneous deps */}
          <IdentityLevel
            ownProfile={isOwnProfile(loggedInMember, profileMember)}
            identityLevel={inviteConfirmed ? 3 : 0}
            networkJoinDate={0}
            trustedByLevel2={0}
            trustedByLevel3={0}
          />
          <WalletButtonLink
            walletLink={`/m/${profileMember.get("username")}/wallet`}
          />
        </div>
      </header>

      <main>
        {inviteConfirmed ? (
          // TODO: should be using internationalized message
          <InviteVideo memberUid={profileMember.get("memberId")} />
        ) : (
          <div>Pending trust confirmation before showing public video</div>
        )}

        <MemberRelations
          invitedByMember={invitedByMember}
          trustedMembers={trustedMembers}
          invitedMembers={invitedMembers}
          trustedByMembers={trustedByMembers}
        />
      </main>
    </ProfileElem>
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
  const profileMember = state.membersNew.byMemberUsername.get(memberUsername);
  if (!profileMember) {
    // trust action could not have been initiated if profile never was initialized
    const isLoading = state.membersNew.byMemberUsername.size === 0;
    return { isLoading, loggedInMember, memberUsername };
  }

  const trustApiCallStatus = getStatusOfApiCall(
    state,
    ApiEndpointName.TRUST_MEMBER,
    profileMember.get("memberId")
  );

  const invitedByMemberId = profileMember.get("invitedBy");
  const invitedByMember =
    invitedByMemberId === GENESIS_MEMBER
      ? GENESIS_MEMBER
      : invitedByMemberId
        ? state.membersNew.byMemberId.get(invitedByMemberId) || GENESIS_MEMBER
        : GENESIS_MEMBER;

  return {
    loggedInMember,
    memberUsername,
    isLoading: false,
    profileData: {
      profileMember,
      // NOTE: these type assertions only work because the client has the full
      // application state, since we run through all operations on the client at
      // the moment. When that changes, this, too, needs to change.
      trustedMembers: getMembersByUid(
        state,
        profileMember.get("trusts").toArray()
      ) as Member[],
      trustedByMembers: getMembersByUid(
        state,
        profileMember.get("trustedBy").toArray()
      ) as Member[],
      invitedMembers: getMembersByUid(
        state,
        profileMember.get("invited").toArray()
      ) as Member[],
      invitedByMember
    },
    trustApiCallStatus
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

  const profileUid = stateProps.profileData.profileMember.get("memberId");
  return {
    ...stateProps,
    trust: () => {
      dispatchProps.trustMember(profileUid);
    }
  };
};

export const Profile = connect(mapStateToProps, { trustMember }, mergeProps)(
  ProfileView
);
