import * as React from "react";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import styled from "styled-components";

import { trustMember } from "../../actions";
import { AppState } from "../../store";
import { Uid, Mid } from "../../identifiers";
import { Member, UidSet, GENESIS_MEMBER } from "../../reducers/membersNew";
import MemberRelations from "./MemberRelations";

import Button, { ButtonType, ButtonSize } from "../../components/Button";
import Loading from "../../components/Loading";
import TrustLevel from "../../components/TrustLevel";
import InviteVideo from "../../components/InviteVideo";
import IntlMessage from "../../components/IntlMessage";
import { ApiEndpoint } from "../../api";

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
  match: { params: { memberMid: Mid } };
}

interface StateProps {
  loggedInMember?: Member;
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
  return !!loggedInMember && loggedInMember.uid === profileMember.uid;
}

function trustsMember(
  loggedInMember: Member | undefined,
  toTrust: Member
): boolean {
  return !!loggedInMember && loggedInMember.trustsSet[toTrust.uid];
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
  }
`;

/**
 * Presentational component for displaying a profile.
 */
const ProfileView: React.StatelessComponent<Props> = props => {
  const { profileData, loggedInMember } = props;
  if (!profileData) {
    return <Loading />;
  }
  const {
    profileMember,
    trustedByMembers,
    trustedMembers,
    invitedByMember,
    invitedMembers
  } = profileData;
  const inviteConfirmed = isInviteConfirmed(profileMember);
  const trustApiCallStatus = props.trustApiCallStatus
    ? props.trustApiCallStatus.status
    : undefined;

  return (
    <ProfileElem>
      <header>
        <h1 className="memberTitle">
          {profileMember.fullName}

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
        {/* TODO: This component looks like it has extraneous deps */}
        <TrustLevel
          ownProfile={isOwnProfile(loggedInMember, profileMember)}
          trustLevel={inviteConfirmed ? 3 : 0}
          networkJoinDate={0}
          trustedByLevel2={0}
          trustedByLevel3={0}
        />
      </header>

      <main>
        {inviteConfirmed ? (
          // TODO: should be using mid
          // TODO: should be using internationalized message
          <InviteVideo memberId={profileMember.mid} />
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
  const profileMember = state.membersNew.byMid[ownProps.match.params.memberMid];
  if (!profileMember) {
    // trust action could not have been initiated if profile never was initialized
    return { loggedInMember };
  }

  const trustApiCallStatus = getStatusOfApiCall(
    state,
    ApiEndpoint.TRUST_MEMBER,
    profileMember.uid
  );

  const invitedByMember =
    profileMember && profileMember.invitedBy === GENESIS_MEMBER
      ? GENESIS_MEMBER
      : state.membersNew.byUid[profileMember.invitedBy];

  return {
    loggedInMember,
    profileData: {
      profileMember,
      trustedMembers: getMembersByUid(state, profileMember.trusts),
      trustedByMembers: getMembersByUid(state, profileMember.trustedBy),
      invitedMembers: getMembersByUid(state, profileMember.invited),
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
> = (stateProps, dispatchProps, ownProps) => {
  if (!stateProps.profileData) {
    return stateProps;
  }

  const profileUid = stateProps.profileData.profileMember.uid;
  return {
    ...stateProps,
    trust: () => {
      dispatchProps.trustMember(profileUid);
    }
  };
};

export default connect(mapStateToProps, { trustMember }, mergeProps)(
  ProfileView
);
