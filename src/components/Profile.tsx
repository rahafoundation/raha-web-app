import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import { fetchMemberByMidIfNeeded, fetchMemberByUidIfNeeded } from "../actions";
import {
  getAuthMemberDoc,
  getAuthMemberDocIsLoaded,
  getMemberDoc
} from "../connectors";
import { getMemberUidToOp, OpLookupTable } from "../helpers/ops";
import { MemberEntry } from "../members";
import { OpCode } from "../operations";
import { AppState } from "../store";
import ActionButton from "./ActionButton";
import Loading from "./Loading";
import MemberRelations from "./MemberRelations";
import TrustLevel from "./TrustLevel";
import InviteVideo from "./InviteVideo";

// TODO: this seems to be duplicated in multiple places
interface OwnProps {
  uid: string;
  match: { params: { memberId: string } };
}
type Props = OwnProps & {
  memberId: string;
  authMemberDoc: firebase.firestore.DocumentSnapshot;
  memberDoc: firebase.firestore.DocumentSnapshot;
  authFirebaseUser: firebase.User | null;
  authMemberDocIsLoaded: boolean;
  fetchMemberByMidIfNeeded: typeof fetchMemberByMidIfNeeded;
  fetchMemberByUidIfNeeded: typeof fetchMemberByUidIfNeeded;
  uid: string;
  trustedByUids: OpLookupTable;
  member: MemberEntry;
};

const ProfileElem = styled.main`
  padding: 0 20px;
  > header {
    margin-bottom: 20px;

    > .memberTitle {
      display: flex;
      align-items: center;

      .trustButton {
        margin-left: 20px;
      }
    }
  }

  .joinVideo {
    max-width: 90vw;
    width: 600px;
    height: 400px;
  }
`;

class Profile extends React.Component<Props> {
  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.memberId) {
      this.props.fetchMemberByMidIfNeeded(nextProps.memberId);
    }
  }

  // TODO should be can take action
  public canTrustThisUser() {
    return (
      !this.isOwnProfile() &&
      this.props.authMemberDoc !== null &&
      this.props.authMemberDoc.id !== this.props.uid &&
      !this.props.trustedByUids.has(this.props.authMemberDoc.id)
    );
  }

  public isOwnProfile() {
    const { authFirebaseUser, memberDoc } = this.props;
    return (
      !!authFirebaseUser && memberDoc && authFirebaseUser.uid === memberDoc.id
    );
  }

  public render() {
    const { authMemberDocIsLoaded, member } = this.props;
    if (!authMemberDocIsLoaded || !member || member.isFetching) {
      return <Loading />;
    }
    const memberDoc = getMemberDoc(member);
    if (!memberDoc || !memberDoc.get("mid")) {
      // TODO make below message nice page
      return <div>Member "{this.props.memberId}" does not exist</div>;
    }
    const ownProfile = this.isOwnProfile();
    const fullName = memberDoc.get("full_name");
    const youtubeUrl = memberDoc.get("video_url");
    return (
      <ProfileElem>
        <header>
          <h1 className="memberTitle">
            {fullName}

            {this.canTrustThisUser() && (
              <ActionButton
                className="trustButton"
                toUid={memberDoc.id}
                toMid={memberDoc.get("mid")}
              />
            )}
          </h1>
          {this.props.trustedByUids !== undefined && (
            // TODO pass in correct props. Should MemberRelations mapStateToProps be in redux?
            <TrustLevel
              ownProfile={ownProfile}
              trustLevel={memberDoc.get("invite_confirmed") ? 3 : 0}
              networkJoinDate={0}
              trustedByLevel2={0}
              trustedByLevel3={0}
            />
          )}
        </header>

        <main>
          {youtubeUrl && (
            <InviteVideo className="joinVideo" userId={memberDoc.id} />
          )}

          <MemberRelations uid={memberDoc.id} mid={memberDoc.get("mid")} />
        </main>
      </ProfileElem>
    );
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps): Partial<Props> {
  const authMemberDoc = getAuthMemberDoc(state);
  const memberId = ownProps.match.params.memberId;

  const receivedOps = Object.entries(state.uidToOpMeta).filter(
    uidOp => uidOp[1].op.applied && uidOp[1].op.data.to_uid === ownProps.uid
  );
  return {
    authFirebaseUser: state.auth.firebaseUser,
    authMemberDoc,
    authMemberDocIsLoaded: getAuthMemberDocIsLoaded(state),
    memberId,
    member: state.members.byMid[memberId],
    trustedByUids: getMemberUidToOp(
      receivedOps,
      OpCode.TRUST,
      x => x.creator_uid
    )
  };
}

export default connect(mapStateToProps, {
  fetchMemberByMidIfNeeded,
  fetchMemberByUidIfNeeded
})(Profile);
