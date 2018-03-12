import React, { Component } from 'react';
import { connect } from 'react-redux';
import { OpCode } from '../operations';
import { db } from '../firebaseInit';
import { fetchOperations, OpMeta } from '../actions';
import { getAuthMemberDoc } from '../connectors';
import { FormattedMessage } from 'react-intl';
import MemberThumbnail from './MemberThumbnail';
import TrustLevel from './TrustLevel';
import ActionButton from './ActionButton';

interface Props {
  uid: string;
  mid: string;
  authMemberDoc: firebase.firestore.DocumentSnapshot;
  trustedByUids: Map<string, OpMeta>;
  trustsUids: Map<string, OpMeta>;
  invitedByUids: Map<string, OpMeta>;
  invitedUids: Map<string, OpMeta>;
}

class MemberRelations extends Component<Props, State> {

  componentDidMount() {
    this.onPropsChange(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.uid !== this.props.uid) {
      this.onPropsChange(nextProps);
    }
  }

  addOpsGroup = (fieldPath, uid) => { // TODO both???
    this.props.fetchOperations(db.collection('operations').where(fieldPath, '==', uid).orderBy('op_seq'));
  }

  onPropsChange = (props) => {
    this.addOpsGroup('creator_uid', props.uid);
    this.addOpsGroup('data.to_uid', props.uid);
  }

  addSection = (sections, sectionUids, titleId) => {
    if (sectionUids.size > 0) {
      const rows = [];
      sectionUids.forEach((opMeta: OpMeta, uid: string) => {
        rows.push(<MemberThumbnail key={uid} uid={uid} opMeta={opMeta} />);
      });
      sections.push(
        <div key={titleId} className="MemberRelations-section">
          <div className="SectionTitle">
          <FormattedMessage id={titleId} values={{value: rows.length}}/> </div>
          {rows}
        </div>
      );
    }
  }

  canTrustThisUser() {
    return this.props.authMemberDoc !== null
      && this.props.authMemberDoc.id !== this.props.uid
      && !this.props.trustedByUids.has(this.props.authMemberDoc.id);
  }

  render() {
    const sections = [];
    // TODO ops should also go in redux, should count number for when people have different trust levels
    if (this.props.trustedByUids !== undefined) {
      sections.push(
        <TrustLevel
          key="Trust Level"
          ownProfile={this.props.authMemberDoc && this.props.authMemberDoc.uid === this.props.uid}
          trustLevel={3}
          networkJoinDate={null}
          trustedByLevel2={null}
          trustedByLevel3={null}
        />
      );
      if (this.canTrustThisUser()) {
        sections.push(<ActionButton key="Trust Button" toUid={this.props.uid} toMid={this.props.mid} />);
      }
      this.addSection(sections, this.props.invitedByUids, 'invited_by');
      this.addSection(sections, this.props.invitedUids, 'invites');
      this.addSection(sections, this.props.trustedByUids, 'trusted_by');
      this.addSection(sections, this.props.trustsUids, 'trusts');
      // Grab and calculate these values based on this.state.trustedByUids and redux store.getState().members.byUid.
    }
    return <div>{sections}</div>;
  }
}

function getMemberUidToOp(uidOps, opCode: OpCode, getUid: Function): Map<string, OpMeta> {
  const res = new Map();
  uidOps.forEach((uidOp) => {
    // eslint-disable-next-line no-unused-vars
    const [opUid, opMeta] = uidOp;
    if (opMeta.op.op_code === opCode) {
      const memberUid = getUid(opMeta.op);
      if (memberUid !== null) { // This is for initial 4 members who were invited by no one.
        res.set(memberUid, opMeta);
      }
    }
  });
  return res;
}

function mapStateToProps(state, ownProps: Props) {
  const authMemberDoc = getAuthMemberDoc(state);
  const receivedOps = Object.entries(state.uidToOpMeta).filter(uidOp => uidOp[1].op.applied && uidOp[1].op.data.to_uid === ownProps.uid);
  const sentOps = Object.entries(state.uidToOpMeta).filter(uidOp => uidOp[1].op.applied && uidOp[1].op.creator_uid === ownProps.uid);
  const trustedByUids = getMemberUidToOp(receivedOps, OpCode.TRUST, x => x.creator_uid);
  const trustsUids = getMemberUidToOp(sentOps, OpCode.TRUST, x => x.data.to_uid);
  const invitedByUids = getMemberUidToOp(sentOps, OpCode.REQUEST_INVITE, x => x.data.to_uid);
  const invitedUids = getMemberUidToOp(receivedOps, OpCode.REQUEST_INVITE, x => x.creator_uid);
  // By default you trust the person your requested invite from.
  invitedByUids.forEach((opMeta, uid) => trustsUids.set(uid, opMeta));
  // People who request invite from you are saying that they trust you.
  invitedUids.forEach((opMeta, uid) => trustedByUids.set(uid, opMeta));
  // TODO handle untrust,  vote
  return { trustedByUids, trustsUids, invitedByUids, invitedUids, authMemberDoc };
}

export default connect(mapStateToProps, { fetchOperations })(MemberRelations);
