import * as React from 'react';
import * as firebase from 'firebase';
import { FirebaseAuth } from 'react-firebaseui';
import { auth } from '../firebaseInit';

const LogIn = ({ noRedirect }) => {
  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
    ]
  };
  if (!noRedirect) {
    uiConfig.signInSuccessUrl = '/me';
  }
  return <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

export default LogIn;
