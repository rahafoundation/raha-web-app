import { OpCode, OpMeta } from '../operations';

export function getMemberUidToOp(uidOps, opCode: OpCode, getUid: Function): Map<string, OpMeta> {
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