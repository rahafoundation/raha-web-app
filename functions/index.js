const admin = require('firebase-admin');
const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const REQUEST_INVITE = 'REQUEST_INVITE';

function createMemberFromOperation(operation: OperationData) {
    const {
        applied,
        block_at,
        block_seq,
        created_at,
        creator_uid,
        creator_mid,
        data,
        op_code,
        op_seq
    } = operation;

    if (applied || op_code !== REQUEST_INVITE) {
        return null;
    }

    const {
        to_uid,
        to_mid,
        video_url,
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
        request_invite_from_mid: to_mid,
        video_url,
    });
}

exports.onCreateOperation = functions.firestore
    .document('/operations/{operationId}')
    .onCreate((event) => {
        const newOperation = event.data.data();
        switch (newOperation.op_code) {
            case REQUEST_INVITE:
                createMemberFromOperation(newOperation).then(() => {
                    return event.data.ref.update({
                        applied: true,
                    });
                }).catch((err) => console.err(`An error occurred while trying to create a member from operation ${newOperation.id}.`, err));
                return 0;
            default:
                console.warn(`Received an unexpected operation: ${newOperation.op_code}.`);
                return 1;
        }
});

async function calcMultiHash(filePath) {
    // TODO
    return new Promise('QmFakeHash');
}

exports.processVideo = functions.storage.object().onChange(async (event) => {
    // TODO create thumbnail? encode?
    const object = event.data; // The Storage object.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

    if (!filePath.startsWith)
    if (contentType !== 'video/mp4') {
        console.err(`Invalid contentType ${contentType} for ${filePath}`);
    }

    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    await bucket.file(filePath).download({ destination: tempFilePath });
    const multihash = calcMultiHash(filePath);

    db.collection('videos').doc(multihash).set({ filePath, bucket });

    // TODO update db.collection('operations');
});
