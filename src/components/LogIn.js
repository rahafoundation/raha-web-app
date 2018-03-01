import * as React from 'react';
import * as firebase from 'firebase';
import { FirebaseAuth } from 'react-firebaseui';
import { auth } from '../firebaseInit';

const UI_CONFIG = {
  signInFlow: 'popup',
  signInSuccessUrl: '/me',
  signInOptions: [
    {
      authMethod: 'https://accounts.google.com',
      clientId: '677137485282-o8enpde66k4rdppkmemh9k7l8gu71sbi.apps.googleusercontent.com',
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID
    }
  ]
};

const LogIn = () => {
  return <FirebaseAuth uiConfig={UI_CONFIG} firebaseAuth={auth} />;
};

export default LogIn;
