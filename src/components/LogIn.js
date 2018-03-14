import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import * as firebase from 'firebase';
import { FirebaseAuth } from 'react-firebaseui';

import { auth } from '../firebaseInit';
import { getAuthMemberDoc } from '../connectors';

const LogIn = ({ authMemberDoc, noRedirect }) => {
  const uiConfig = {
    signInFlow: 'popup',
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
  if (authMemberDoc && !noRedirect) {
    return (
      <Redirect to={`/m/${authMemberDoc.get('mid')}`} replace />
    )
  } else {
    return <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
  }
};

function mapStateToProps(state, ownProps) {
  const authMemberDoc = getAuthMemberDoc(state);
  return { authMemberDoc };
}

export default connect(mapStateToProps)(LogIn);
