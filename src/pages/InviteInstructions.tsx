import * as React from "react";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { AppState } from "../store";
import { ApiEndpoint } from "../api";
import { getStatusOfApiCall } from "../selectors/apiCalls";
import { sendInvite } from "../actions";
import { ApiCallStatusType, ApiCallStatus } from "../reducers/apiCalls";

import Button, { ButtonSize } from "../components/Button";

import { green } from "../constants/palette";

const InviteInstructionsElem = styled.section`
  padding: 10px;
  max-width: 80vw;
  min-width: 400px;
  display: flex;
  flex-direction: column;

  > form {
    > .successStatus {
      margin: 10px;
      color: ${green};
    }

    > .failureStatus {
      margin: 10px;
      color: "red";
    }
  }
`;

interface OwnProps {
  inviteUrl: string;
  fullName: string;
}
interface StateProps {
  sendInviteApiCallStatus?: ApiCallStatus;
}
interface DispatchProps {
  sendInvite: typeof sendInvite;
}
type Props = OwnProps & StateProps & DispatchProps;

function invite(sendInviteAction: typeof sendInvite) {
  const inviteForm = document.forms.namedItem("sendEmailInviteForm");
  const inviteEmailElem = inviteForm.elements.namedItem(
    "inviteEmail"
  ) as HTMLInputElement;
  const inviteEmail = inviteEmailElem ? inviteEmailElem.value : undefined;
  if (inviteEmail && inviteForm.checkValidity()) {
    sendInviteAction(inviteEmail, API_CALL_ID);
  } else {
    alert("Email invalid.");
  }
}

const API_CALL_ID = Math.random().toString(36);

const InviteInstructions: React.StatelessComponent<Props> = props => {
  const { inviteUrl, fullName, sendInviteApiCallStatus } = props;

  let isSendingInvite = false;
  let statusMessage = null;
  if (sendInviteApiCallStatus) {
    const status = sendInviteApiCallStatus.status;
    switch (status) {
      case ApiCallStatusType.STARTED:
        isSendingInvite = true;
        break;
      case ApiCallStatusType.SUCCESS:
        statusMessage = (
          <span className="successStatus">
            <FormattedMessage id="invite_instructions_email_sent_message" />
          </span>
        );
        break;
      case ApiCallStatusType.FAILURE:
        statusMessage = (
          <span className="failureStatus">
            <FormattedMessage id="invite_Instructions_email_failed_message" />
          </span>
        );
        break;
    }
  }

  return (
    <InviteInstructionsElem>
      <h3>
        <FormattedMessage id="invite_instructions_header" />
      </h3>
      <form name="sendEmailInviteForm">
        <strong>
          <FormattedMessage id="invite_instructions_send_email_label" />
        </strong>
        <input name="inviteEmail" type="email" className="InviteInput" />
        <Button
          size={ButtonSize.REGULAR}
          onClick={() => invite(props.sendInvite)}
          disabled={isSendingInvite}
        >
          <FormattedMessage id="invite_instructions_send_email_button" />
        </Button>
        {statusMessage}
      </form>
      <h4>
        <FormattedMessage id="invite_instructions_direct_link_label" />
      </h4>
      <a href={inviteUrl}>{inviteUrl}</a>
    </InviteInstructionsElem>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state,
  ownProps
) => {
  return {
    sendInviteApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpoint.SEND_INVITE,
      API_CALL_ID
    )
  };
};

export default connect(mapStateToProps, { sendInvite })(InviteInstructions);
