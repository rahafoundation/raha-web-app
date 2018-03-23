import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const InviteInstructionsElem = styled.section`
  padding: 10px;
  width: 80vw;
`;

export default function InviteInstructions(props) {
  const { inviteUrl, fullName } = props;
  return (
    <InviteInstructionsElem>
      <FormattedMessage id="invite_others_instructions" values={{
        github_issue: <a href="https://github.com/rahafoundation/raha.io/issues">Github Issue</a>,
        full_name: fullName,
        invite_link: <a href={inviteUrl}>{inviteUrl}</a>,
        ideas_email: <a href="mailto:ideas@raha.io?subject=Raha%20Improvement">ideas@raha.io</a>,
      }}/>
    </InviteInstructionsElem>
  );
}
