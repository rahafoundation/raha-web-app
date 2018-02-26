import * as firebase from 'firebase';
import 'firebase/firestore';

firebase.initializeApp(require('./data/firebase.config.json'));

export const auth = firebase.auth();
export const db = firebase.firestore();
