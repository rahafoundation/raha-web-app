import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { getAuthMemberDoc } from '../connectors';
import { getTrustOperation } from '../operations';
import { postOperation } from '../actions';

// TODO code duplication in functions/srs/index.ts, decomp.

interface Props {
  toUid: string;
  toMid: string;
}

// TODO(#8) instead of only trust, should be multi-functional button
class ActionButton extends Component<Props> {
  state = {}

  onTrustClick = () => {
    const trustOp = getTrustOperation(this.props.toUid, this.props.toMid, this.props.authMemberDoc.id, this.props.authMemberDoc.get('mid'));
    this.props.postOperation(trustOp);
  }

  onInviteClick = () => {
    this.setState({ invite: true });
  }

  render() {
    if (this.state.invite) {
      return <Redirect to={`/m/${this.props.toMid}/invite`} />
    }
    if (this.props.authMemberDoc.id && this.props.authMemberDoc.get('mid')) {
      return <button className="ActionButton" onClick={this.onTrustClick}>Trust</button>;
    } else {
      return <button className="ActionButton" onClick={this.onInviteClick}>Share Invite Video to Join</button>;
    }
  }
}

function mapStateToProps(state) {
  return { authMemberDoc: getAuthMemberDoc(state) };
}

export default connect(mapStateToProps, { postOperation })(ActionButton);
