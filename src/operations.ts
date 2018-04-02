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

const getOperation = (opCode: OpCode, creatorMid: string, creatorUid: string, data): Operation => {
  return {
    applied: false,
    block_at: null,
    block_seq: null,
    created_at: new Date(),
    creator_uid: creatorUid,
    creator_mid: creatorMid,
    data,
    op_code: opCode,
    op_seq: null
  };
};

export const getTrustOperation = (creatorMid: string, creatorUid: string, toMid: string, toUid: string): Operation => {
  return getOperation(OpCode.TRUST, creatorMid, creatorUid, { to_uid: toUid, to_mid: toMid });
};

export const getRequestInviteOperation = (
  creatorMid: string,
  creatorUid: string,
  toMid: string,
  toUid: string,
  fullName: string,
  videoUrl: string
): Operation => {
  return getOperation(OpCode.REQUEST_INVITE, creatorMid, creatorUid, { to_uid: toUid, to_mid: toMid, video_url: videoUrl, full_name: fullName});
};
