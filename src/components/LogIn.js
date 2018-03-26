import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import * as firebase from 'firebase';
import { FirebaseAuth } from 'react-firebaseui';

import Loading from './Loading';
import { auth } from '../firebaseInit';
import { getAuthMemberDocIsLoaded, getAuthMemberDoc } from '../connectors';

const LogIn = ({ authFirebaseUser, authMemberDocIsLoaded, authMemberDoc, noRedirect }) => {
  const uiConfig = {
    signInFlow: 'popup', // TODO will 'redirect' fix some of our issues?
    signInOptions: [
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
    ], callbacks: {
      signInSuccess: () => {
        // Prevent FirebaseAuth from redirecting on success.
        // We handle redirect manually below.
        return false;
      }
    },
  };
  if (!noRedirect) {
    if (!authMemberDocIsLoaded) return <Loading />;
    if (authMemberDoc && authMemberDoc.exists) {
      return <Redirect to={`/m/${authMemberDoc.get('mid')}`} />;
    }
    if (authFirebaseUser) {
      return <Redirect to={`/invite_missing`} />;
    }
  }
  return <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

function mapStateToProps(state, ownProps) {
  return {
    authFirebaseUser: state.auth.firebaseUser,
    authMemberDocIsLoaded: getAuthMemberDocIsLoaded(state),
    authMemberDoc: getAuthMemberDoc(state)
  };
}

export default connect(mapStateToProps)(LogIn);
