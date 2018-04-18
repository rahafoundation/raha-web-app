import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import {
  InteractiveForceGraph,
  ForceGraphNode,
  ForceGraphArrowLink
} from "react-vis-force";

import { AppState } from "../reducers";
import { Member } from "../reducers/membersNew";

interface OwnProps {}
interface StateProps {
  members: Member[];
}
interface DispatchProps {}
type Props = OwnProps & StateProps & DispatchProps;

const NetworkElem = styled.main`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Network: React.StatelessComponent<Props> = ({ members }) => {
  const graphNodes: Array<typeof ForceGraphNode> = [];
  const trustEdges: Array<typeof ForceGraphArrowLink> = [];
  const inviteEdges: Array<typeof ForceGraphArrowLink> = [];
  members.forEach(member => {
    graphNodes.push(
      <ForceGraphNode
        key={member.uid}
        node={{ id: member.uid, label: member.mid }}
        fill="gray"
      />
    );
    Object.keys(member.trustsSet).forEach(trustedUid => {
      trustEdges.push(
        <ForceGraphArrowLink
          key={`${member.uid}=>${trustedUid}`}
          link={{ source: member.uid, target: trustedUid, value: 1 }}
          stroke="blue"
        />
      );
    });
    Object.keys(member.invitedSet).forEach(invitedUid => {
      inviteEdges.push(
        <ForceGraphArrowLink
          key={`${member.uid}=>${invitedUid}`}
          link={{ source: member.uid, target: invitedUid, value: 1 }}
          stroke="green"
        />
      );
    });
  });
  return (
    <NetworkElem>
      <section>
        <h1>Raha Invite Graph</h1>
        <InteractiveForceGraph
          labelAttr="label"
          highlightDependencies={true}
          simulationOptions={{
            animate: true
          }}
          zoom={true}
        >
          {graphNodes}
          {inviteEdges}
        </InteractiveForceGraph>
      </section>
      <section>
        <h1>Raha Trust Graph</h1>
        <InteractiveForceGraph
          labelAttr="label"
          highlightDependencies={true}
          simulationOptions={{
            animate: true
          }}
          zoom={true}
        >
          {graphNodes}
          {trustEdges}
        </InteractiveForceGraph>
      </section>
    </NetworkElem>
  );
};

function mapStateToProps(state: AppState): StateProps {
  return { members: Object.values(state.membersNew.byMid) };
}

export default connect(mapStateToProps)(Network);
