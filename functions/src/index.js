import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import { getMemberId, getPrefixFromMemberId, getSuffixFromMemberId } from '../../members';
import { OpCode } from '../../operations';

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

function createMemberFromOperation(operation) {
    const {
        applied:,
        block_at:,
        block_seq:,
        created_at:,
        creator_uid:,
        creator_mid:,
        data,
        op_code,
        op_seq
    } = operation;

    if (applied || op_code != OpCode.REQUEST_INVITE) {
        return;
    }

    const {
        to_uid,
        to_mid,
        video_url,
        full_name
    } = data;

    // TODO(rahul): does a member already exist?
    const newMember = db.collection('members').doc();
    const newMemberId = getMemberId(full_name);
    newMember.set({
        full_name,
        invite_confirmed: false,
        mid: newMemberId,
        mid_prefix: getPrefixFromMemberId(newMemberId),
        mid_suffix: getSuffixFromMemberId(newMemberId),
        request_invite_block_at: block_at,
        request_invite_block_seq: block_seq,
        request_invite_op_seq: op_seq,
        request_invite_from_uid: creator_uid,
        request_invite_from_mid: creator_mid,
        video_url: video_url,
    });
}

exports.onCreateOperation = functions.firestore
    .document('/operations/{operationId}')
    .onCreate((event) => {
        const newOperation = event.data.data();
        switch(newOperation.op_code) {
            case OpCode.REQUEST_INVITE:
                createMemberFromOperation(newOperation);
                break;
            default:
                return;
        }
});
