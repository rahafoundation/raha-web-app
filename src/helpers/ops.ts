import { OpDoc, Operation } from "../operations";
import { OperationType } from "@raha/api-shared/dist/models/Operation";

export type OpLookupTable = Map<string, Operation>;

type UidOps = [string, Operation];
export function getMemberUidToOp(
  uidOps: UidOps[],
  opCode: OperationType,
  getUid: (op: OpDoc) => string
): OpLookupTable {
  const res = new Map();
  uidOps.forEach(uidOp => {
    // eslint-disable-next-line no-unused-vars
    const opMeta = uidOp[1];
    if (opMeta.op.op_code === opCode) {
      const memberUid = getUid(opMeta.op);
      if (memberUid !== null) {
        // This is for initial 4 members who were invited by no one.
        res.set(memberUid, opMeta);
      }
    }
  });
  return res;
}
