import * as firebase from "firebase";
import * as React from "react";
import { FirebaseAuth } from "react-firebaseui";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import { getAuthMemberDoc, getAuthMemberDocIsLoaded } from "../connectors";
import { auth } from "../firebaseInit";
import { MemberDoc } from "../members";
import { AppState } from "../store";

import Loading from "./Loading";

interface StateProps {
  authFirebaseUser?: firebase.User;
  authMemberDocIsLoaded: boolean;
  authMemberDoc: MemberDoc;
}
type Props = StateProps & {
  noRedirect: boolean;
};
const LogIn: React.StatelessComponent<Props> = ({
  authFirebaseUser,
  authMemberDocIsLoaded,
  authMemberDoc,
  noRedirect
}) => {
  const uiConfig = {
    signInFlow: "redirect",
    signInOptions: [
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccess: () => {
        // Prevent FirebaseAuth from redirecting on success.
        // We handle redirect manually below.
        return false;
      }
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
      return <Redirect to={`/invite_missing`} />;
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

export default connect(mapStateToProps)(LogIn);
