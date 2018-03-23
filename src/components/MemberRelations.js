import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import { faHandshake, faHandPeace, faEnvelope } from '@fortawesome/fontawesome-free-regular'
import styled from 'styled-components';
import { green, interactive } from '../constants/palette';

import { OpCode } from '../operations';
import { db } from '../firebaseInit';
import { fetchOperations, OpMeta } from '../actions';
import { getAuthMemberDoc } from '../connectors';
import MemberThumbnail from './MemberThumbnail';
import { getMemberUidToOp } from '../helpers/ops';

interface Props {
  uid: string;
  mid: string;
  authMemberDoc: firebase.firestore.DocumentSnapshot;
  trustedByUids: Map<string, OpMeta>;
  trustsUids: Map<string, OpMeta>;
  invitedByUids: Map<string, OpMeta>;
  invitedUids: Map<string, OpMeta>;
}

const icons = {
  trusted_by: faHandPeace,
  trusts: faHandshake,
  invited_by: faHandshake,
  invited: faEnvelope
}

/********************
 * Styled components
 ********************
 */

const MemberListElem = styled.div`
  max-width: ${props => props.expanded ? "none" : "600px"};
  background: #f4f4f4;
  border: #efefef;
  border-radius: 3px;

  > header {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;

    background: ${green};
    color: white;
    padding: 10px;
    margin-bottom: 10px;

    > .relationIcon {
      font-size: 1.5rem;
      margin-right: 10px;
    }

    &:focus ~ .members {
      display: block;
    }

    > .numMembers {
      font-weight: bold;
    }
  }

  > main {
    padding: 10px;
    text-align: center;
  }

  > footer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-bottom: 20px;
    padding-right: 10px;

    { /* TODO: make this a general purpose button style */ }
    .expandBtn {
      background: none;
      border: none;
      font-size: 1rem;
      font-weight: bold;
      color: ${interactive.secondary};
      cursor: pointer;
      text-decoration: underline;

      :hover, :active, :focus {
        color: ${interactive.secondaryHover};
      }
    }
  }
`;

const Members = styled.ul`
  padding: 0;
  margin: 0;
  list-style-type: none;
  text-align: left;

  > li {
    display: inline-block;
    margin: .25rem;
  }
`;

// TODO: handle via react-intl
// TODO: convert to component, mention a few people's names as well, currently
// inconvenient since memberDocs may not be loaded, not part of `members`
function pluralizeRemainingMembers(numRemaining) {
  if (numRemaining === 0) {
    return "";
  }

  if (numRemaining === 1) {
    return "and one more member";
  }

  return `and ${numRemaining} more members`;
}

interface MemberListProps {
  titleId: 'trusted' | 'trusts' | 'invited_by' | 'invited',
  membersByUid: Map<string, OpMeta>
}

interface MemberListState {
  expanded: boolean
}

class MemberList extends React.Component<MemberListProps, MemberListState> {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  handleExpand(expanded: boolean) {
    return () => {
      this.setState({ expanded });
    };
  }

  render() {
    const { titleId, membersByUid } = this.props;
    const { expanded } = this.state;

    const INITIAL_LIST_SIZE = 4;

    // singleton to handle people who weren't invited by anyone—namely,
    // Mark Ulrich and his family.
    if (titleId === 'invited_by' && membersByUid.size === 0) {
      return null;
    }
    const members = Array.from(membersByUid).map(([uid: string, opMeta: OpMeta]) =>
      <li key={uid}><MemberThumbnail uid={uid} opMeta={opMeta} /></li>
    );

    const numRemainingMembers = Math.max((members.length - INITIAL_LIST_SIZE), 0);

    return (
      <MemberListElem key={titleId} expanded={expanded}>
        <header>
          <FontAwesomeIcon className="relationIcon" icon={icons[titleId]} />
          <FormattedMessage className="messageTitle" id={titleId} />&nbsp;
        </header>
        <main>
          {members.length === 0 &&
            <span>No other members yet</span>
          }
          <Members>{expanded ? members : members.slice(0, INITIAL_LIST_SIZE)}</Members>
        </main>

        <footer>
          <button className="expandBtn" onClick={this.handleExpand(!expanded)}>
            { expanded ?
              "Hide full list"
              : pluralizeRemainingMembers(numRemainingMembers)
            }
          </button>
        </footer>
      </MemberListElem>
    );
  }
}

/**********
 * Styles *
 **********
 */
const MemberRelationsElem = styled.section`
  display: flex;
  flex-wrap: wrap;

  > * {
    flex-basis: 40%;
    margin: 10px;
  }
`;

class MemberRelations extends Component<Props> {

  componentDidMount() {
    this.onPropsChange(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.uid !== this.props.uid) {
      this.onPropsChange(nextProps);
    }
  }

  // TODO: this sort of behavior probably shouldn't happen in the component
  addOpsGroup = (fieldPath, uid) => { // TODO both???
    this.props.fetchOperations(db.collection('operations').where(fieldPath, '==', uid).orderBy('op_seq'));
  }

  onPropsChange = (props) => {
    this.addOpsGroup('creator_uid', props.uid);
    this.addOpsGroup('data.to_uid', props.uid);
  }

  render() {
    const sections = {
      invited_by: this.props.invitedByUids,
      invited: this.props.invitedUids,
      trusted_by: this.props.trustedByUids,
      trusts: this.props.trustsUids
    }

    const renderedSections = Object.keys(sections).map(titleId =>
      <MemberList
        key={titleId} titleId={titleId} membersByUid={sections[titleId]}
      />
    )
    return (
      <MemberRelationsElem>
        {renderedSections}
      </MemberRelationsElem>
    )
  }
}

function mapStateToProps(state, ownProps: Props) {
  const authMemberDoc = getAuthMemberDoc(state);
  const receivedOps = Object.entries(state.uidToOpMeta).filter(uidOp => uidOp[1].op.applied && uidOp[1].op.data.to_uid === ownProps.uid);
  const sentOps = Object.entries(state.uidToOpMeta).filter(uidOp => uidOp[1].op.applied && uidOp[1].op.creator_uid === ownProps.uid);
  const trustedByUids = getMemberUidToOp(receivedOps, OpCode.TRUST, x => x.creator_uid);
  const trustsUids = getMemberUidToOp(sentOps, OpCode.TRUST, x => x.data.to_uid);
  const invitedByUids = getMemberUidToOp(sentOps, OpCode.REQUEST_INVITE, x => x.data.to_uid);
  const invitedUids = getMemberUidToOp(receivedOps, OpCode.REQUEST_INVITE, x => x.creator_uid);
  // By default you trust the person your requested invite from.
  invitedByUids.forEach((opMeta, uid) => trustsUids.set(uid, opMeta));
  // People who request invite from you are saying that they trust you.
  invitedUids.forEach((opMeta, uid) => trustedByUids.set(uid, opMeta));
  // TODO handle untrust,  vote
  return { trustedByUids, trustsUids, invitedByUids, invitedUids, authMemberDoc };
}

export default connect(mapStateToProps, { fetchOperations })(MemberRelations);
