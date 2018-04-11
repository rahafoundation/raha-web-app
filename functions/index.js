const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const REQUEST_INVITE = 'REQUEST_INVITE';

function createMemberFromOperation(operation) {
    const {
        block_at,
        block_seq,
        created_at,
        creator_uid,
        creator_mid,
        data,
        op_code,
        op_seq
    } = operation;

    if (op_code !== REQUEST_INVITE) {
        return null;
    }

    const {
        to_uid,
        to_mid,
        full_name
    } = data;

    const newMember = db.collection('members').doc(creator_uid);
    // By using `create`, we ensure that this operation will fail
    // if the document already exists.
    return newMember.create({
        full_name,
        invite_confirmed: false,
        mid: creator_mid,
        request_invite_block_at: block_at,
        request_invite_block_seq: block_seq,
        request_invite_op_seq: op_seq,
        request_invite_from_uid: to_uid,
        request_invite_from_mid: to_mid
    });
}

exports.onCreateOperation = functions.firestore
    .document('/operations/{operationId}')
    .onCreate((event) => {
        const newOperation = event.data.data();
        switch (newOperation.op_code) {
            case REQUEST_INVITE:
                return createMemberFromOperation(newOperation);
            default:
                console.warn(`Received an unexpected operation: ${newOperation.op_code}.`);
                return 1;
        }
});
