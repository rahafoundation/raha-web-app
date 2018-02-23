import * as React from 'react';
import { Link } from 'react-router-dom';

import { db } from '../firebaseInit';
import { OpCode } from '../operations';

import MemberThumbnail from './MemberThumbnail';
import TrustLevel from './TrustLevel';

type OpCodeToDocs = Map<string, firebase.firestore.DocumentSnapshot>;

interface MemberRelationsProps {
  uid: string;
}

interface MemberRelationsState {
  ops: OpCodeToDocs;
  trustedByUids: Map<string, string>;
  trustsUids: Map<string, string>;
  invitedByUids: Map<string, string>;
  invitedUids: Map<string, string>;
}

class MemberRelations extends React.Component<MemberRelationsProps, MemberRelationsState> {
  constructor(props: MemberRelationsProps) {
    super(props);
    this.state = { ops: null, trustedByUids: null, trustsUids: null, invitedByUids: null, invitedUids: null };
  }

  componentDidMount() {
    this.onPropsChange(this.props);
  }

  componentWillReceiveProps(nextProps: MemberRelationsProps) {
    if (nextProps.uid !== this.props.uid) {
      this.onPropsChange(nextProps);
    }
  }

  addOpsGroup = async (fieldPath, uid) => {
    const snap = await db.collection('operations').where(fieldPath, '==', uid).orderBy('op_seq').get();
    return snap.docs.reduce((res, s) => res.set(s.id, s), new Map());
  }

  getKeysForOps = (
    documents: Map<string, firebase.firestore.DocumentSnapshot>,
    opCode: OpCode, idKey: string
  ): Map<string, string> => {
    const res = new Map();
    documents.forEach((opDoc, opId) => {
      if (opDoc.get('op_code') === opCode) {
        const uid = opDoc.get(idKey);
        if (uid !== null) {
          res.set(uid, opId);
        }
      }
    });
    return res;
  }

  onPropsChange = async (props) => {
    const [sentOps, receivedOps] = await Promise.all([
      this.addOpsGroup('creator_uid', props.uid),
      this.addOpsGroup('data.to_uid', props.uid)
    ]);
    const trustedByUids = this.getKeysForOps(receivedOps, OpCode.TRUST, 'creator_uid');
    const trustsUids = this.getKeysForOps(sentOps, OpCode.TRUST, 'data.to_uid');
    const invitedByUids = this.getKeysForOps(sentOps, OpCode.REQUEST_INVITE, 'data.to_uid');
    const invitedUids = this.getKeysForOps(receivedOps, OpCode.REQUEST_INVITE, 'creator_uid');
    // By default you trust the person your requested invite from.
    invitedByUids.forEach((doc, uid) => trustsUids.set(uid, doc));
    // People who request invite from you are saying that they trust you.
    invitedUids.forEach((doc, uid) => trustedByUids.set(uid, doc));
    // TODO handle untrust,  vote
    this.setState({ ops: Object.assign(sentOps, receivedOps), trustedByUids, trustsUids, invitedByUids, invitedUids });
  }

  addSection = (sections, sectionUids, title) => {
    if (sectionUids.size > 0) {
      // TODO(#14) should intially get memberUid, then do db.batch() for all additional member info (pic, full_name)
      // const ops = this.state.ops;
      const rows = Array.from(sectionUids.entries()).map((opIdAndUid: Array<string>) => {
        const [uid, opId] = opIdAndUid;
        return <MemberThumbnail applied={true} key={uid} uid={uid} />;
      });
      sections.push(
        <div key={title} className="MemberRelations-section">
          <div className="SectionTitle">{`${title} (${rows.length})`}</div>
          {rows}
        </div>
      );
    }
  }

  render() {
    const sections = [];
    // TODO ops should also go in redux, should count number for when people have different trust levels
    if (this.state.ops) {
      this.addSection(sections, this.state.invitedByUids, 'Invited By');
      this.addSection(sections, this.state.invitedUids, 'Invites');
      this.addSection(sections, this.state.trustedByUids, 'Trusted by');
      this.addSection(sections, this.state.trustsUids, 'Trusts');
      // Grab and calculate these values based on this.state.trustedByUids and redux store.getState().uidToMembers.
      sections.push(
        <TrustLevel
          key="Trust Level"
          trustLevel={3}
          networkJoinDate={null}
          trustedByLevel2={null}
          trustedByLevel3={null}
        />
      );
    }
    return <div>{sections}</div>;
  }
}

export default MemberRelations;
