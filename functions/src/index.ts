import * as admin from 'firebase-admin';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as functions from 'firebase-functions';

// Punctuation and numbers not expected in names (allow .-')
const BAD_NAME_PUNCTUATION_REGEX = /[,\/#!$%\^&\*;:{}=\_`~()0-9]/g;

// Match EMOJIs
const EMOJI_REGEX = /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g;

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

function isSignedIn(auth) {
    auth.uid != null;
}

function getNumberSuffix(len: number) {
    const exclusiveMax = Math.pow(10, len);
    return (Math.floor(Math.random() * exclusiveMax) + exclusiveMax).toString().substring(1);
}

function getUserName(fullName: string): string {
    return fullName.toLowerCase().replace(/\s*/g, '.').replace(/\.+/g, '') + '#' + getNumberSuffix(4);
}

function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());
}

// Should either have a space or CJK ideographs
function checkFirstAndLast(name: string): void {
    if (!name.match(' ') && !name.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/)) {
        throw Error('Please give your first and last name separated by a space');
    }
}

function removeExtraWhitespace(text: string) {
    return text.replace(/\s*/g, ' ');
}

function sanitizeName(name: string): string {
    return removeExtraWhitespace(name.replace(BAD_NAME_PUNCTUATION_REGEX, '').replace(EMOJI_REGEX, ''));
}

function sanitizeAndValidatedName(name: string) {
    name = sanitizeName(name);
    if (name.length < 3) {
        throw Error('Name too short');
    }
    if (name.length > 20) {
        throw Error('Name too long');
    }
    checkFirstAndLast(name);
    return name;
}

// Addopted from https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js.
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !req.cookies.__session) {
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
        req.user = decodedIdToken;
        return next();
    }).catch((error) => {
        res.status(403).send('Unauthorized');
    });
};

const expressApp = express();
expressApp.use(cookieParser())
expressApp.use(cookieParser());
expressApp.use(validateFirebaseIdToken);

// TODO add tests for this endpoint
expressApp.post('/createUser', (req: any, res) => {
    // TODO update via db.runTransaction
    res.send(`Created ${req.user.displayName}`);
});

// This HTTPS endpoint can only be accessed by our Firebase Users
export const app = functions.https.onRequest(expressApp);