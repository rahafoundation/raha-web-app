export enum OpCode {
  ADMIN = 'ADMIN',
  FLAG = 'FLAG',
  REQUEST_INVITE = 'REQUEST_INVITE',
  TRUST = 'TRUST',
  UNADMIN = 'UNADMIN',
  UNFLAG = 'UNFLAG',
  UNTRUST = 'UNTRUST',
  VOTE = 'VOTE'
}

interface ToId {
  to_mid: string;
  to_uid: string;
}

interface RequestInviteOpData extends ToId {
  full_name: string;
}

type TrustOpData = ToId;

export interface OpMeta {
  uid: string;
  inDb: boolean;
}

export type OpDoc = firebase.firestore.DocumentData;
export type Operation = OpMeta & {
  op: OpDoc;
};

type OpData = TrustOpData | RequestInviteOpData;
export interface OperationData {
  block_at: Date | null;
  block_seq: number | null;
  created_at: Date; // firebase.firestore.FieldValue;
  creator_mid: string;
  creator_uid: string;
  data: OpData;
  op_code: OpCode;
  op_seq: number | null;
}

const getOperation = (
  opCode: OpCode, creatorMid: string, creatorUid: string, data: OpData
): OperationData => {
  return {
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

export const getTrustOperation = (
  creatorMid: string, creatorUid: string, toMid: string, toUid: string
): OperationData => {
  return getOperation(OpCode.TRUST, creatorMid, creatorUid, { to_uid: toUid, to_mid: toMid });
};

export const getRequestInviteOperation = (
  creatorMid: string,
  creatorUid: string,
  toMid: string,
  toUid: string,
  fullName: string
): OperationData => {
  return getOperation(
    OpCode.REQUEST_INVITE,
    creatorMid,
    creatorUid,
    {
      to_uid: toUid, to_mid: toMid, full_name: fullName
    }
  );
};
