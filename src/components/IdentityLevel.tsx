import { faCheckCircle } from "@fortawesome/fontawesome-free-solid";
import * as FontAwesomeIcon from "@fortawesome/react-fontawesome";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { green } from "../constants/palette";

const TrustSuggestion = (
  identityLevel: number,
  networkJoinDate: number,
  trustedByLevel2: number,
  trustedByLevel3: number
) => {
  const MILLI_PER_DAY = 86400000;
  if (
    networkJoinDate >
    new Date().getTime() - (identityLevel + 1) * 7 * MILLI_PER_DAY
  ) {
    return (
      <div>
        <FormattedMessage id="identity_suggestion_active_longer" />
      </div>
    );
  }
  switch (identityLevel) {
    case 0:
      if (trustedByLevel2 + trustedByLevel3 < 2) {
        return (
          <div>
            <FormattedMessage
              id="identity_suggestion_recieve_trust"
              values={{
                accounts: 2 - (trustedByLevel2 + trustedByLevel3),
                accountlevel: 2
              }}
            />
          </div>
        );
      }
      break;
    case 1:
      if (trustedByLevel3 < 3) {
        return (
          <div>
            <FormattedMessage
              id="identity_suggestion_recieve_trust"
              values={{ accounts: 3 - trustedByLevel3, accountlevel: 3 }}
            />
          </div>
        );
      }
      break;
    case 2:
      if (trustedByLevel3 < 5) {
        return (
          <div>
            <FormattedMessage
              id="identity_suggestion_recieve_trust"
              values={{ accounts: 5 - trustedByLevel3, accountlevel: 3 }}
            />
          </div>
        );
      }
      break;
    case 3:
      return (
        <div>
          <FormattedMessage id="identity_suggestion_max" />
        </div>
      );
    default:
      return null;
  }
  return null;
};

const TrustElem = styled.div`
  > .identityLevelReadout {
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

interface Props {
  ownProfile: boolean;
  identityLevel: number;
  networkJoinDate: number;
  trustedByLevel2: number;
  trustedByLevel3: number;
}

// TODO only show TrustSuggestion if current user is viewing.
// Based on the FAQ trust is determined by:
// 1. Time on the network
// 2. Number of Level 2 and 3 accounts that trust this account
// 3. Level 3 verification video in last month || invited in first month
const IdentityLevel: React.StatelessComponent<Props> = ({
  ownProfile,
  identityLevel,
  networkJoinDate,
  trustedByLevel2,
  trustedByLevel3
}) => {
  return (
    <TrustElem>
      <span className="identityLevelReadout">
        <FontAwesomeIcon className="icon" icon={faCheckCircle} />
        <span className="text">
          <FormattedMessage id="identity_level" />&nbsp;
          <span className="number">{identityLevel}</span>
        </span>
      </span>
      {ownProfile &&
        TrustSuggestion(
          identityLevel,
          networkJoinDate,
          trustedByLevel2,
          trustedByLevel3
        )}
    </TrustElem>
  );
};

export { IdentityLevel }
