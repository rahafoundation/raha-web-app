import * as firebase from 'firebase';
import 'firebase/firestore';
import * as fs from 'fs';
// tslint:disable-next-line:no-var-requires
const firebaseConfig = require('./data/firebase.config.json');

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
// Because firebase.storage does not work in Node.js, check it exists so tests still pass
export const storageRef = firebase.storage && firebase.storage().ref();
