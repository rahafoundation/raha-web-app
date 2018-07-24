import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { ApiEndpointName } from "@raha/api-shared/routes/ApiEndpoint";

import { AppState } from "../store";
import { getStatusOfApiCall } from "../selectors/apiCalls";
import { sendInvite } from "../actions";
import { ApiCallStatusType, ApiCallStatus } from "../reducers/apiCalls";

import { Button, ButtonSize } from "../components/Button";

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

const getInviteEmailForm: () => HTMLFormElement | undefined = () => {
  return document.forms.namedItem("sendEmailInviteForm");
};

const getInviteEmailFormValue: () => string | undefined = () => {
  const inviteForm = getInviteEmailForm();
  if (!inviteForm) {
    return;
  }
  const inviteEmailElem = inviteForm.elements.namedItem(
    "inviteEmail"
  ) as HTMLInputElement;
  return inviteEmailElem ? inviteEmailElem.value : undefined;
};

const invite: (
  sendInviteAction: typeof sendInvite
) => void = sendInviteAction => {
  const inviteForm = getInviteEmailForm();
  if (!inviteForm) {
    return;
  }
  const inviteEmail = getInviteEmailFormValue();
  if (inviteEmail && inviteForm.checkValidity()) {
    sendInviteAction(inviteEmail);
  } else {
    alert("Email invalid.");
  }
};

const InviteInstructionsView: React.StatelessComponent<Props> = props => {
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
  const inviteEmail = getInviteEmailFormValue();
  if (!inviteEmail) {
    return {};
  }
  return {
    sendInviteApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.SEND_INVITE,
      inviteEmail
    )
  };
};

export const InviteInstructions = connect(mapStateToProps, { sendInvite })(
  InviteInstructionsView
);
