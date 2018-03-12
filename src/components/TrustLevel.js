import React from 'react';
import { FormattedMessage } from 'react-intl';

// TODO only show TrustSuggestion if current user is viewing.
// Based on the FAQ trust is determined by:
// 1. Time on the network
// 2. Number of Level 2 and 3 accounts that trust this account
// 3. Level 3 verification video in last month || invited in first month
const TrustLevel = ({ ownProfile, trustLevel, networkJoinDate, trustedByLevel2, trustedByLevel3 }) => {
  return (
    <div className="Trust">
      <div>Trust Level: {trustLevel}</div>
      {ownProfile && TrustSuggestion(trustLevel, networkJoinDate, trustedByLevel2, trustedByLevel3)}
    </div>
  );
};

const TrustSuggestion = (trustLevel, networkJoinDate, trustedByLevel2, trustedByLevel3) => {
  const MILLI_PER_DAY = 86400000;
  if (networkJoinDate > new Date().getTime() - (((trustLevel + 1) * 7) * MILLI_PER_DAY)) {
    return <div><FormattedMessage id="trust_suggestion_active_longer" /></div>;
  }
  switch (trustLevel) {
    case 0:
      if (trustedByLevel2 + trustedByLevel3 < 2) {
        return (
           <div> <FormattedMessage id="trust_suggestion_recieve_trust" 
           values={{accounts: 2 - (trustedByLevel2 + trustedByLevel3), accountlevel: 2}} /></div>
        );
      }
      break;
    case 1:
      if (trustedByLevel3 < 3) {
        return (
           <div> <FormattedMessage id="trust_suggestion_recieve_trust" 
           values={{accounts: 3 - (trustedByLevel3), accountlevel: 3}} /></div>
        );
      }
      break;
    case 2:
      if (trustedByLevel3 < 5) {
        return (
           <div> <FormattedMessage id="trust_suggestion_recieve_trust" 
           values={{accounts: 5 - (trustedByLevel3), accountlevel: 3}} /></div>
        );
      }
      break;
    case 3:
      return <div> <FormattedMessage id="trust_suggestion_max" /></div>;
    default:
      return null;
  }
  return null;
};

export default TrustLevel;
