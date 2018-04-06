import * as React from "react";
import { Redirect } from "react-router-dom";
import { auth } from "../firebaseInit";

function LogOut() {
  auth.signOut();
  return <Redirect to="/" />;
}

export default LogOut;
