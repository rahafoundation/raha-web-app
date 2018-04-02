import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import RahaTitle from "./RahaTitle";

const PageNotFound = () => (
  <div className="PageNotFound">
    <RahaTitle />
    <FormattedMessage
      id="page_not_found"
      values={{ 404: <strong>404</strong>, home: <Link to="/">home</Link> }}
    />
    <p>¯\_(ツ)_/¯</p>
  </div>
);

export default PageNotFound;
