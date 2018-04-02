import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import styled from "styled-components";

import { postOperation } from "../actions";
import { getAuthMemberDoc } from "../connectors";
import { interactive } from "../constants/palette";
import { MemberDoc } from "../members";
import { getTrustOperation } from "../operations";
import { AppState } from "../store";

// TODO code duplication in functions/srs/index.ts, decomp.

interface Props {
  toUid: string;
  toMid: string;
  authMemberDoc: MemberDoc;
  postOperation: typeof postOperation;
  className: string;
}

interface State {
  invite?: boolean;
}

const ButtonElem = styled.button`
  cursor: pointer;
  color: white;
  background: ${interactive.primary};
  transition: background-color 0.25s;

  font-size: 1rem;
  padding: 10px 20px;
  border: none;
  border-radius: 2px;

  :hover,
  :active,
  :focus {
    background: ${interactive.primaryHover};
  }
`;

// TODO(#8) instead of only trust, should be multi-functional button
class ActionButton extends React.Component<Props, State> {
  public state: State = {};

  public onTrustClick = () => {
    const trustOp = getTrustOperation(
      this.props.authMemberDoc.get("mid"),
      this.props.authMemberDoc.id,
      this.props.toMid,
      this.props.toUid
    );
    this.props.postOperation(trustOp);
  };

  public onInviteClick = () => {
    this.setState({ invite: true });
  };

  public render() {
    if (this.state.invite) {
      return <Redirect to={`/m/${this.props.toMid}/invite`} />;
    }
    if (this.props.authMemberDoc.id && this.props.authMemberDoc.get("mid")) {
      return (
        <ButtonElem
          onClick={this.onTrustClick}
          className={this.props.className}
        >
          <FormattedMessage id="action_button.trust" />
        </ButtonElem>
      );
    } else {
      return (
        <ButtonElem
          onClick={this.onInviteClick}
          className={this.props.className}
        >
          <FormattedMessage id="action_button.share_invite" />
        </ButtonElem>
      );
    }
  }
}

function mapStateToProps(state: AppState) {
  return { authMemberDoc: getAuthMemberDoc(state) };
}

export default connect(mapStateToProps, { postOperation })(ActionButton);
