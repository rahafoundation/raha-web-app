import * as React from 'react';
import RahaTitle from './RahaTitle';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import STRINGS from '../strings';

const PageNotFound = () => (
  <div className="PageNotFound">
    <RahaTitle />
     <FormattedMessage {...STRINGS.page_not_found} 
     values={{404: <strong>404</strong>, home: <Link to="/">home</Link>}} />
    <p>¯\_(ツ)_/¯</p>
  </div>
);

export default PageNotFound;
