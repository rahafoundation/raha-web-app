import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { fetchMemberByUidIfNeeded, OpMeta } from '../actions';

const Loading = () => {
  return <div>Loading</div>;
};

interface Props {
  uid: string;
  opMeta: OpMeta;
  memberDoc?: firebase.firestore.DocumentData;
}

// TODO(#14) improve this thumbnail
class MemberThumbnail extends Component<Props> {
  componentDidMount() {
    this.props.fetchMemberByUidIfNeeded(this.props.uid);
  }

  render() {
    const memberDoc = this.props.memberDoc && this.props.memberDoc.memberDoc;
    if (!memberDoc) {
      return <div className="MemberThumbnail"><Loading /></div>;
    }
    const mid = memberDoc.get('mid');
    const name = memberDoc.get('full_name');
    return (
      <div className="MemberThumbnail">
        <Link className={this.props.opMeta.inDb ? 'Green' : 'Grey'} to={`/m/${mid}`}>{name}</Link>
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    return { memberDoc: state.members.byUid[ownProps.uid] };
  },
  {
    fetchMemberByUidIfNeeded
  }
)(MemberThumbnail);
