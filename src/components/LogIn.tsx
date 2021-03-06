import * as firebase from "firebase";
import * as React from "react";
import { FirebaseAuth } from "react-firebaseui";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import { getAuthMemberDoc, getAuthMemberDocIsLoaded } from "../connectors";
import { auth } from "../firebaseInit";
import { MemberDoc } from "../members";
import { AppState } from "../store";

import { Loading } from "../components/Loading";

interface StateProps {
  authFirebaseUser?: firebase.User;
  authMemberDocIsLoaded: boolean;
  authMemberDoc: MemberDoc;
}
type Props = StateProps & {
  noRedirect: boolean;
  signInSuccessCallback?: () => boolean;
};
const LogInView: React.StatelessComponent<Props> = ({
  authFirebaseUser,
  authMemberDocIsLoaded,
  authMemberDoc,
  noRedirect,
  signInSuccessCallback
}) => {
  const signInSuccess =
    signInSuccessCallback ||
    // Default action is to prevent FirebaseAuth from redirecting on success.
    // We handle redirect manually below.
    (() => false);

  const uiConfig = {
    signInFlow: "redirect",
    signInOptions: [
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccess
    }
  };
  if (!noRedirect) {
    if (!authMemberDocIsLoaded) {
      return <Loading />;
    }
    if (authMemberDoc && authMemberDoc.exists) {
      return <Redirect to={`/m/${authMemberDoc.get("username")}`} />;
    }
    if (authFirebaseUser) {
      return <Redirect to={`/invite-missing`} />;
    }
  }
  return <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

function mapStateToProps(state: AppState): StateProps {
  return {
    authFirebaseUser: state.auth.firebaseUser,
    authMemberDocIsLoaded: getAuthMemberDocIsLoaded(state),
    authMemberDoc: getAuthMemberDoc(state)
  };
}

export const LogIn = connect(mapStateToProps)(LogInView);
