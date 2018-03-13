import * as React from 'react';
import { Link } from 'react-router-dom';

import RahaTitle from './RahaTitle';

const Splash = () => (
  <div className="Splash">
    <RahaTitle />
    <div className="App-intro">Trusted Identity and Equal Opportunity</div>
    <div className="App-intro">Invite Only</div>
    <div className="App-intro">Already a member? <Link to="/login">Login</Link></div>
  </div>
);

export default Splash;
