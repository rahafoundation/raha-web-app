import * as firebase from 'firebase';
import 'firebase/firestore';
import * as fs from 'fs';
// tslint:disable-next-line:no-var-requires
const CONFIG = require('./data/config.json');

firebase.initializeApp(CONFIG.firebase);

export const auth = firebase.auth();
export const db = firebase.firestore();
// Because firebase.storage does not work in Node.js, check it exists so tests still pass
export const storageRef = firebase.storage && firebase.storage().ref();
