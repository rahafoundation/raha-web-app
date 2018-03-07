import * as React from 'react';
import * as firebase from 'firebase';
import { FirebaseAuth } from 'react-firebaseui';
import { auth } from '../firebaseInit';

const UI_CONFIG = {
  signInFlow: 'popup',
  signInSuccessUrl: '/me',
  signInOptions: [
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
  ]
};

const LogIn = () => {
  return <FirebaseAuth uiConfig={UI_CONFIG} firebaseAuth={auth} />;
};

export default LogIn;
