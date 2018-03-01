import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getAuthMemberData } from '../connectors';
import { getTrustOperation } from '../operations';
import { postOperation } from '../actions';

// TODO code duplication in functions/srs/index.ts, decomp.

interface Props {
  toUid: string;
  toMid: string;
}

// TODO(#8) instead of only trust, should be multi-functional button
class TrustButton extends Component<Props> {
  onClick = () => {
    const trustOp = getTrustOperation(this.props.toUid, this.props.toMid, this.props.authMemberData.id, this.props.authMemberData.get('mid'));
    this.props.postOperation(trustOp);
  }

  render() {
    return (
      <button className="TrustButton" onClick={this.onClick}>Trust</button>
    );
  }
}

function mapStateToProps(state) {
  return { authMemberData: getAuthMemberData(state) };
}

export default connect(mapStateToProps, { postOperation })(TrustButton);
