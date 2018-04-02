import React from 'react';
import { FormattedMessage as FM } from 'react-intl';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/fontawesome-free-solid';
import styled from 'styled-components';

import {green} from '../constants/palette';

const TrustElem = styled.div`
  > .trustLevelReadout {
    display: inline-flex;
    align-items: center;

    > .icon {
      margin-right: 5px;
      color: ${green};
      font-size: 2rem;
    }

    > .text > .number {
      font-weight: bold;
    }
  }
`;

// TODO only show TrustSuggestion if current user is viewing.
// Based on the FAQ trust is determined by:
// 1. Time on the network
// 2. Number of Level 2 and 3 accounts that trust this account
// 3. Level 3 verification video in last month || invited in first month
const TrustLevel = ({ ownProfile, trustLevel, networkJoinDate, trustedByLevel2, trustedByLevel3 }) => {
  return (
    <TrustElem>
      <span className="trustLevelReadout">
        <FontAwesomeIcon className="icon" icon={faCheckCircle} />
        <span className="text">
          <FM id='trust_level' />&nbsp;
          <span className="number">{trustLevel}</span>
        </span>
      </span>
      {ownProfile && TrustSuggestion(trustLevel, networkJoinDate, trustedByLevel2, trustedByLevel3)}
    </TrustElem>
  );
};

const TrustSuggestion = (trustLevel, networkJoinDate, trustedByLevel2, trustedByLevel3) => {
  const MILLI_PER_DAY = 86400000;
  if (networkJoinDate > new Date().getTime() - (((trustLevel + 1) * 7) * MILLI_PER_DAY)) {
    return <div><FM id="trust_suggestion_active_longer" /></div>;
  }
  switch (trustLevel) {
    case 0:
      if (trustedByLevel2 + trustedByLevel3 < 2) {
        return (
           <div> <FM id="trust_suggestion_recieve_trust"
           values={{accounts: 2 - (trustedByLevel2 + trustedByLevel3), accountlevel: 2}} /></div>
        );
      }
      break;
    case 1:
      if (trustedByLevel3 < 3) {
        return (
           <div> <FM id="trust_suggestion_recieve_trust"
           values={{accounts: 3 - (trustedByLevel3), accountlevel: 3}} /></div>
        );
      }
      break;
    case 2:
      if (trustedByLevel3 < 5) {
        return (
           <div> <FM id="trust_suggestion_recieve_trust"
           values={{accounts: 5 - (trustedByLevel3), accountlevel: 3}} /></div>
        );
      }
      break;
    case 3:
      return <div> <FM id="trust_suggestion_max" /></div>;
    default:
      return null;
  }
  return null;
};

export default TrustLevel;