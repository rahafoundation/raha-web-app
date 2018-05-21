/**
 * For users who are logged in but have not issued any REQUEST_INVITE operation,
 * they have no member id so the page /m/:memberId does not exist. Instead after
 * log in they will be taken to this page at /invite_missing where we explain
 * how they can request and invite to become Raha members.
 */

import * as React from "react";
import { FormattedMessage as FM } from "react-intl";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";

import { getAuthMemberDoc, getAuthMemberDocIsLoaded } from "../connectors";
import { MemberDoc } from "../members";
import { AppState } from "../store";

import Loading from "../components/Loading";

interface StateProps {
  authFirebaseUser?: firebase.User;
  authIsLoaded: boolean;
  authMemberDocIsLoaded: boolean;
  authMemberDoc: MemberDoc;
}
type Props = StateProps;
// TODO redirect if you are registered
const InviteMissing: React.StatelessComponent<Props> = ({
  authFirebaseUser,
  authIsLoaded,
  authMemberDocIsLoaded,
  authMemberDoc
}) => {
  if (!authIsLoaded) {
    return <Redirect to="/login" />;
  }
  if (!authMemberDocIsLoaded) {
    return <Loading />;
  }
  if (authMemberDoc && authMemberDoc.exists) {
    return <Redirect to={`/m/${authMemberDoc.get("username")}`} />;
  }
  return (
    <FM
      id="invite_missing"
      values={{
        // TODO: is this how we want to handle potentially undefined user?
        display_name: authFirebaseUser ? authFirebaseUser.displayName : "",
        help_email: <a href="mailto:help@raha.io">help@raha.io</a>,
        login_account: <b>{authFirebaseUser ? authFirebaseUser.email : ""}</b>,
        logout: <Link to="/logout">logout</Link>
      }}
    />
  );
};

function mapStateToProps(state: AppState): StateProps {
  const authMemberDoc = getAuthMemberDoc(state);
  return {
    authIsLoaded: !!state.auth.firebaseUser,
    authFirebaseUser: state.auth.firebaseUser,
    authMemberDocIsLoaded: getAuthMemberDocIsLoaded(state),
    authMemberDoc
  };
}

export default connect(mapStateToProps, {})(InviteMissing);
