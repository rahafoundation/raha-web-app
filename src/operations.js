import { auth } from './firebaseInit';  // TODO pass in auth.currentUser.uid

export const OpCode = {
  ADMIN: 'ADMIN',
  FLAG: 'FLAG',
  REQUEST_INVITE: 'REQUEST_INVITE',
  TRUST: 'TRUST',
  UNADMIN: 'UNADMIN',
  UNFLAG: 'UNFLAG',
  UNTRUST: 'UNTRUST',
  VOTE: 'VOTE'
}

interface ToId {
  to_mid: string;
  to_uid: string;
}

interface RequestInviteOpData extends ToId {
  video_url: string;
  full_name: string;
}

interface TrustOpData extends ToId { }

export interface Operation {
  applied: false;
  block_at: Date;
  block_seq: number;
  created_at: Date; // firebase.firestore.FieldValue;
  creator_mid: string;
  creator_uid: string;
  data: (TrustOpData | RequestInviteOpData);
  op_code: OpCode;
  op_seq: number;
}

const getOperation = (opCode: OpCode, creatorMid: string, data): Operation => {
  return {
    applied: false,
    block_at: null,
    block_seq: null,
    created_at: new Date(),
    creator_uid: auth.currentUser.uid,
    creator_mid: creatorMid,
    data,
    op_code: opCode,
    op_seq: null
  };
};

export const getTrustOperation = (toUid: string, toMid: string, creatorUid: string, creatorMid: string): Operation => {
  return getOperation(OpCode.TRUST, creatorMid, { to_uid: toUid, to_mid: toMid });
};
