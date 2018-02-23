import * as React from 'react';
import RahaTitle from './RahaTitle';
import { Link } from 'react-router-dom';

const PageNotFound = () => (
  <div className="PageNotFound">
    <RahaTitle />
    <p><strong>404</strong> page not found, go <Link to="/">home</Link>.</p>
    <p>¯\_(ツ)_/¯</p>
  </div>
);

export default PageNotFound;
