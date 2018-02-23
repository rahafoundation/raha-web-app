import * as React from 'react';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { fetchMemberIfNeeded } from '../actions';

const Loading = () => {
  return <div>Loading</div>;
};

interface MemberThumbnailProps {
  uid: string;
  applied: boolean;
  memberData?: firebase.firestore.DocumentData;
}

// TODO(#14) improve this thumbnail
class MemberThumbnail extends React.Component<MemberThumbnailProps, {}> {
  componentDidMount() {
    fetchMemberIfNeeded(this.props.uid); // TODO memberUid;
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
        <Link to={`/m/${mid}`}>{name}</Link>
      </div>
    );
  }
}

export default connect(
  (state, ownProps: MemberThumbnailProps) => {
    return { memberData: state.uidToMembers[ownProps.uid] };
  },
  null
)(MemberThumbnail);
