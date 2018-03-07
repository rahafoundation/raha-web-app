import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { fetchMemberIfNeeded, OpMeta } from '../actions';

const Loading = () => {
  return <div>Loading</div>;
};

interface Props {
  uid: string;
  opMeta: OpMeta;
  memberData?: firebase.firestore.DocumentData;
}

// TODO(#14) improve this thumbnail
class MemberThumbnail extends Component<Props> {
  componentDidMount() {
    this.props.fetchMemberIfNeeded(this.props.uid);
  }

  render() {
    const memberDoc = this.props.memberData && this.props.memberData.doc;
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
    return { memberData: state.uidToMembers[ownProps.uid] };
  },
  {
    fetchMemberIfNeeded
  }
)(MemberThumbnail);
