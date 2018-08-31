/**
 * TODO: Would be nice if this at some point were actually an API model.
 */
import { Reducer } from "redux";
import { Big } from "big.js";

import {
  Operation,
  OperationType,
  MintType
} from "@raha/api-shared/dist/models/Operation";
import {
  MemberId,
  MemberUsername
} from "@raha/api-shared/dist/models/identifiers";

import { Set, Map } from "immutable";
import { MembersAction, OperationsActionType } from "../actions";

// tslint:disable-next-line:no-var-requires
const CONFIG = require("../data/config.json");

export const GENESIS_CREATE_MEMBER_OPS = [
  "InuYAjMISl6operovXIR",
  "SKI5CxMXWd4qjJm1zm1y",
  "SUswrxogVQ6S0rH8O2h7",
  "Y8FiyjOLs9O8AZNGzhwQ"
];
export const GENESIS_VERIFY_OPS = [
  "qOEVqNGusyeQCgHdCPH0",
  "JL0xoltdHyRjDLVRbOhR",
  "quYwzTPmplD37t2hoYIP",
  "U4epeWMpG9RrSGskWYGE"
];
export const GENESIS_MEMBER = Symbol("GENESIS");
export const RAHA_BASIC_INCOME_MEMBER = Symbol("RAHA_BASIC_INCOME_MEMBER_ID");

function getDefaultMemberFields(): OptionalMemberFields {
  return {
    balance: new Big(0),
    totalDonated: new Big(0),
    totalMinted: new Big(0),
    trustedBy: Set<MemberId>(),
    invited: Set<MemberId>(),
    invitedBy: undefined,
    trusts: Set<MemberId>(),
    verified: Set<MemberId>(),
    requestedVerificationFrom: Set<MemberId>(),
    requestedForVerificationBy: Set<MemberId>(),
    verifiedBy: Set<MemberId>()
  };
}

interface OptionalMemberFields {
  balance: Big;
  totalDonated: Big;
  totalMinted: Big;
  trustedBy: Set<MemberId>;
  invited: Set<MemberId>;
  invitedBy: MemberId | typeof GENESIS_MEMBER | undefined;
  trusts: Set<MemberId>;
  verified: Set<MemberId>;
  requestedVerificationFrom: Set<MemberId>;
  requestedForVerificationBy: Set<MemberId>;
  verifiedBy: Set<MemberId>;
}

interface RequiredMemberFields {
  memberId: MemberId;
  username: string;
  fullName: string;
  createdAt: Date;
  isVerified: boolean;
  inviteConfirmed: boolean;
  lastMintedBasicIncomeAt: Date;
  lastOpCreatedAt: Date;
}

type MemberFields = RequiredMemberFields & OptionalMemberFields;

export class Member {
  protected readonly fields: MemberFields;
  public get<Key extends keyof MemberFields>(field: Key): MemberFields[Key] {
    return this.fields[field];
  }

  constructor(values: RequiredMemberFields & Partial<OptionalMemberFields>) {
    // if a field is missing from values, it gets filled in from defaults
    this.fields = { ...getDefaultMemberFields(), ...values };
  }

  protected withFields(newFields: Partial<MemberFields>) {
    return new Member({ ...this.fields, ...newFields });
  }

  public updateLastOpCreatedAt(lastOpCreatedAt: Date) {
    return this.withFields({ lastOpCreatedAt });
  }

  /* =======================
   * ACCOUNT BALANCE METHODS
   * =======================
   */
  public mintRaha(amount: Big, mintDate?: Date) {
    return this.withFields({
      balance: this.fields.balance.plus(amount),
      lastMintedBasicIncomeAt: mintDate
        ? mintDate
        : this.fields.lastMintedBasicIncomeAt,
      totalMinted: this.fields.totalMinted.plus(amount)
    });
  }

  public giveRaha(amount: Big) {
    return this.withFields({
      balance: this.fields.balance.minus(amount)
    });
  }

  public receiveRaha(amount: Big, donation_amount: Big) {
    return this.withFields({
      balance: this.fields.balance.plus(amount),
      totalDonated: this.fields.totalDonated.plus(donation_amount)
    });
  }

  /* =====================
   * RELATIONSHIP METHODS
   * =====================
   * TODO: consider moving these relationships into their own reducers, rather
   * than having them directly on members, to avoid having to keep member
   * states all in sync.
   */
  public inviteMember(memberId: MemberId) {
    return this.withFields({
      invited: this.fields.invited.add(memberId),
      trustedBy: this.fields.trustedBy.add(memberId)
    });
  }

  public trustMember(memberId: MemberId) {
    return this.withFields({
      trusts: this.fields.trusts.add(memberId)
    });
  }

  public beTrustedByMember(memberId: MemberId) {
    return this.withFields({
      trustedBy: this.fields.trustedBy.add(memberId)
    });
  }

  public requestVerificationFromMember(memberId: MemberId) {
    return this.withFields({
      requestedVerificationFrom: this.fields.requestedVerificationFrom.add(
        memberId
      )
    });
  }

  public beRequestedForVerificationBy(memberId: MemberId) {
    return this.withFields({
      requestedForVerificationBy: this.fields.requestedForVerificationBy.add(
        memberId
      )
    });
  }

  public verifyMember(memberId: MemberId) {
    return this.withFields({
      verified: this.fields.verified.add(memberId)
    });
  }

  public beVerifiedByMember(memberId: MemberId) {
    return this.withFields({
      verifiedBy: this.fields.verifiedBy.add(memberId),
      isVerified: true,
      inviteConfirmed:
        this.fields.inviteConfirmed || this.fields.invitedBy === memberId
    });
  }

  /* =====================
   * GET HELPERS
   * =====================
   */
  public get videoUri(): string {
    return `https://storage.googleapis.com/${CONFIG.publicVideoBucket}/${
      this.fields.memberId
    }/invite.mp4`;
  }
}

export interface MembersState {
  byMemberId: Map<MemberId, Member>;
  byMemberUsername: Map<MemberUsername, Member>;
}

/**
 * @returns true if relevant/false otherwise
 * @throws OperationInvalidError if invalid
 */
function operationIsRelevantAndValid(operation: Operation): boolean {
  if (!operation.creator_uid) {
    if (GENESIS_VERIFY_OPS.includes(operation.id)) {
      return false; // no need for the genesis ops to be reflected in app state.
    }
    throw new Error("All operations must have a creator id");
  }
  if (operation.op_code === OperationType.CREATE_MEMBER) {
    return true;
  }
  if (operation.op_code === OperationType.REQUEST_VERIFICATION) {
    return !!operation.data.to_uid;
  }
  if (operation.op_code === OperationType.VERIFY) {
    return !!operation.data.to_uid;
  }
  if (operation.op_code === OperationType.REQUEST_INVITE) {
    // Force to boolean
    // TODO: consider how else this could be messed up
    if (!!operation.data.to_uid) {
      return true;
    }
    return false;
  }

  if (operation.op_code === OperationType.TRUST) {
    return !!operation.data.to_uid;
  }

  if (operation.op_code === OperationType.MINT) {
    try {
      // tslint:disable-next-line:no-unused-expression We're initializing the big to validate
      new Big(operation.data.amount);
      return true;
    } catch (error) {
      return false;
    }
  }

  if (operation.op_code === OperationType.GIVE) {
    try {
      // tslint:disable-next-line:no-unused-expression We're initializing the big to validate
      new Big(operation.data.amount);
      // tslint:disable-next-line:no-unused-expression We're initializing the big to validate
      new Big(operation.data.donation_amount);
      return true;
    } catch (error) {
      return false;
    }
  }

  if (operation.op_code === OperationType.INVITE) {
    return true;
  }
  return false;
}

function memberIdPresentInState(prevState: MembersState, memberId: MemberId) {
  return prevState.byMemberId.has(memberId);
}

function assertMemberIdPresentInState(
  prevState: MembersState,
  memberId: MemberId,
  operation: Operation
) {
  if (!memberIdPresentInState(prevState, memberId)) {
    throw new Error(
      `Invalid operation with id ${operation.id}: user ${memberId} not present`
    );
  }
}

function assertMemberIdNotPresentInState(
  prevState: MembersState,
  memberId: MemberId,
  operation: Operation
) {
  if (memberIdPresentInState(prevState, memberId)) {
    throw new Error(
      `Invalid operation with id ${
        operation.id
      } user ${memberId} already present`
    );
  }
}

function addMemberToState(
  prevState: MembersState,
  member: Member
): MembersState {
  return {
    byMemberUsername: prevState.byMemberUsername.set(
      member.get("username"),
      member
    ),
    byMemberId: prevState.byMemberId.set(member.get("memberId"), member)
  };
}
function addMembersToState(
  prevState: MembersState,
  members: Member[]
): MembersState {
  return members.reduce(
    (memo, member) => addMemberToState(memo, member),
    prevState
  );
}

/**
 * TODO (code cleanup): Avoid having to assert on id present for almost every operation type.
 */
function applyOperation(
  prevState: MembersState,
  operation: Operation
): MembersState {
  const { creator_uid, created_at } = operation;

  try {
    if (!operationIsRelevantAndValid(operation)) {
      return prevState;
    }
    const createdAt = new Date(created_at);
    const creator = prevState.byMemberId.get(creator_uid);
    const newState = creator
      ? addMemberToState(prevState, creator.updateLastOpCreatedAt(createdAt))
      : prevState;

    switch (operation.op_code) {
      case OperationType.CREATE_MEMBER: {
        const {
          full_name,
          username,
          request_invite_from_member_id
        } = operation.data;

        if (!GENESIS_CREATE_MEMBER_OPS.includes(operation.id)) {
          if (request_invite_from_member_id) {
            assertMemberIdPresentInState(
              newState,
              request_invite_from_member_id,
              operation
            );
          }
        }

        const memberData = {
          memberId: creator_uid,
          username,
          fullName: full_name,
          createdAt,
          inviteConfirmed: false,
          isVerified: false,
          lastMintedBasicIncomeAt: createdAt,
          lastOpCreatedAt: createdAt
        };

        // the initial users weren't invited by anyone; so no need to hook up any associations.
        if (GENESIS_CREATE_MEMBER_OPS.includes(operation.id)) {
          return addMemberToState(
            newState,
            new Member({
              ...memberData,
              invitedBy: GENESIS_MEMBER,
              inviteConfirmed: true,
              isVerified: true
            })
          );
        }

        assertMemberIdNotPresentInState(newState, creator_uid, operation);

        const newMember = new Member({
          ...memberData,
          ...(request_invite_from_member_id
            ? { invitedBy: request_invite_from_member_id }
            : {})
        });

        if (request_invite_from_member_id) {
          newMember.trustMember(request_invite_from_member_id);
        }

        const inviter = request_invite_from_member_id
          ? newState.byMemberId.get(request_invite_from_member_id)
          : undefined;
        const updatedInviter = inviter
          ? inviter.inviteMember(creator_uid)
          : undefined;

        return addMembersToState(newState, [
          newMember,
          ...(updatedInviter ? [updatedInviter] : [])
        ]);
      }
      case OperationType.REQUEST_VERIFICATION: {
        const { to_uid } = operation.data;

        assertMemberIdPresentInState(newState, creator_uid, operation);
        assertMemberIdPresentInState(newState, to_uid, operation);

        const requester = (newState.byMemberId.get(
          creator_uid
        ) as Member).requestVerificationFromMember(to_uid);
        const requestee = (newState.byMemberId.get(
          to_uid
        ) as Member).beRequestedForVerificationBy(creator_uid);

        return addMembersToState(newState, [requester, requestee]);
      }
      case OperationType.VERIFY: {
        const { to_uid } = operation.data;

        assertMemberIdPresentInState(newState, to_uid, operation);

        // This association does not need to be created if this is a GENESIS verification operation,
        // as the IsVerified flag has already been marked true on GENESIS members.
        if (GENESIS_VERIFY_OPS.includes(operation.id)) {
          return newState;
        }

        assertMemberIdPresentInState(newState, creator_uid, operation);
        const verifier = (newState.byMemberId.get(
          creator_uid
        ) as Member).verifyMember(to_uid);
        const verified = (newState.byMemberId.get(
          to_uid
        ) as Member).beVerifiedByMember(creator_uid);
        return addMembersToState(newState, [verifier, verified]);
      }
      case OperationType.REQUEST_INVITE: {
        const { full_name, to_uid, username } = operation.data;

        const memberData = {
          memberId: creator_uid,
          username,
          fullName: full_name,
          createdAt,
          lastMintedBasicIncomeAt: createdAt,
          lastOpCreatedAt: createdAt
        };

        assertMemberIdPresentInState(newState, to_uid, operation);
        assertMemberIdNotPresentInState(newState, creator_uid, operation);

        const inviter = (newState.byMemberId.get(
          to_uid
        ) as Member).inviteMember(creator_uid);
        const inviteRequester = new Member({
          ...memberData,
          invitedBy: to_uid,
          inviteConfirmed: false,
          isVerified: false
        }).trustMember(to_uid);
        return addMembersToState(newState, [inviter, inviteRequester]);
      }
      case OperationType.TRUST: {
        const { to_uid } = operation.data;

        assertMemberIdPresentInState(newState, creator_uid, operation);
        assertMemberIdPresentInState(newState, to_uid, operation);
        const truster = (newState.byMemberId.get(
          creator_uid
        ) as Member).trustMember(to_uid);
        const trusted = (newState.byMemberId.get(
          to_uid
        ) as Member).beTrustedByMember(creator_uid);
        return addMembersToState(newState, [truster, trusted]);
      }
      case OperationType.MINT: {
        const { amount, type } = operation.data;

        assertMemberIdPresentInState(newState, creator_uid, operation);
        const minter = (newState.byMemberId.get(
          creator_uid
        ) as Member).mintRaha(
          new Big(amount),
          type === MintType.BASIC_INCOME
            ? new Date(operation.created_at)
            : undefined
        );
        return addMembersToState(newState, [minter]);
      }
      case OperationType.GIVE: {
        const { to_uid, amount, donation_to, donation_amount } = operation.data;

        assertMemberIdPresentInState(newState, creator_uid, operation);
        assertMemberIdPresentInState(newState, to_uid, operation);
        // TODO: Update donationRecipient state.
        // Currently we don't do this as RAHA isn't a normal member created via a REQUEST_INVITE operation.
        // Thus RAHA doesn't get added to the members state in the current paradigm.

        const giver = (newState.byMemberId.get(creator_uid) as Member).giveRaha(
          new Big(amount).plus(donation_amount)
        );
        const recipient = (newState.byMemberId.get(
          to_uid
        ) as Member).receiveRaha(new Big(amount), new Big(donation_amount));

        return addMembersToState(newState, [giver, recipient]);
      }
      default:
        return newState;
    }
  } catch (err) {
    if (err instanceof Error) {
      // tslint:disable-next-line:no-console
      console.error(err);
      // TODO: [#log] do real logging
      // tslint:disable-next-line:no-console
      console.warn("Operation invalid", operation);
      return prevState;
    }
    throw err;
  }
}

/**
 * Strict ordering of different op codes in case two operations have the same time stamp.
 * TODO: Lift this into Operation/model in @raha/api-shared.
 */
const OP_CODE_ORDERING = [
  OperationType.CREATE_MEMBER,
  OperationType.REQUEST_INVITE,
  OperationType.REQUEST_VERIFICATION,
  OperationType.VERIFY,
  OperationType.TRUST,
  OperationType.MINT,
  OperationType.GIVE,
  OperationType.INVITE
];

function compareOperations(op1: Operation, op2: Operation) {
  const op1Time = new Date(op1.created_at).getTime();
  const op2Time = new Date(op2.created_at).getTime();
  if (op1Time === op2Time) {
    const op1Ordering = OP_CODE_ORDERING.indexOf(op1.op_code);
    const op2Ordering = OP_CODE_ORDERING.indexOf(op2.op_code);
    // This has undefined behavior when one or both of the op_codes is invalid,
    // but that's okay since we don't apply those to state anyway.
    return op1Ordering - op2Ordering;
  }
  return op1Time - op2Time;
}

const initialState: MembersState = {
  byMemberId: Map(),
  byMemberUsername: Map()
};
export const reducer: Reducer<MembersState> = (
  state = initialState,
  untypedAction
) => {
  const action = untypedAction as MembersAction;
  switch (action.type) {
    case OperationsActionType.ADD_OPERATIONS: {
      const sortedOperations = action.operations.sort(compareOperations);
      return sortedOperations.reduce(
        (curState, operation) => applyOperation(curState, operation),
        state
      );
    }
    case OperationsActionType.SET_OPERATIONS: {
      const sortedOperations = action.operations.sort(compareOperations);
      return sortedOperations.reduce(
        (curState, operation) => applyOperation(curState, operation),
        // The SET_OPERATIONS action rebuilds member state from scratch.
        initialState
      );
    }
    default:
      return state;
  }
};
