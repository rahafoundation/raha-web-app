import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import styled from "styled-components";
import { green50 } from "material-ui/styles/colors";

import { Uid } from "../identifiers";
import { AppState } from "../store";
import { Member } from "../reducers/membersNew";
import { Operation, OperationType } from "../reducers/operations";
import { getMembersByUid } from "../selectors/members";

import IntlMessage from "./IntlMessage";

// styling from: https://material-components.github.io/material-components-web-catalog/#/component/list
const OperationList = styled.ul`
  padding: 8px 0px;
  background-color: ${green50};
  border: 1px solid rgba(0, 0, 0, 0.1);

  > li {
    list-style-type: none;
    height: 48px;
    padding: 0px 16px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .operation_text {
      display: flex;
      flex-direction: column;
      line-height: 1.48rem;
      justify-content: center;

      .secondary_text {
        margin-left: 16px;
        color: #888;
      }
    }
  }
`;

interface RequestInviteProps {
  fullName: string;
}
const RequestInvite: React.StatelessComponent<RequestInviteProps> = props => (
  <li>
    <span className="operation_text">
      <IntlMessage
        id="operationList.requestInvite"
        values={{ fullName: <b>{props.fullName}</b> }}
      />
    </span>
  </li>
);

interface TrustProps {
  fullName: string;
}
const Trust: React.StatelessComponent<TrustProps> = props => (
  <li>
    <span className="operation_text">
      <IntlMessage
        id="operationList.trust"
        values={{ fullName: <b>{props.fullName}</b> }}
      />
    </span>
  </li>
);

interface MintProps {
  amount: string;
}
const Mint: React.StatelessComponent<MintProps> = props => (
  <li>
    <span className="operation_text">
      <IntlMessage
        id="operationList.mint"
        values={{
          amount: <b>{props.amount}</b>
        }}
      />
    </span>
  </li>
);

interface GiveProps {
  amount: string;
  fullName: string;
  memo?: string;
}
const Give: React.StatelessComponent<GiveProps> = props => (
  <li>
    <span className="operation_text">
      <IntlMessage
        id="operationList.give"
        values={{
          amount: <b>{props.amount}</b>,
          fullName: <b>{props.fullName}</b>
        }}
      />
      {props.memo ? <span className="secondary_text">{props.memo}</span> : null}
    </span>
  </li>
);

interface OwnProps {
  operations: Operation[];
}
interface StateProps {
  getMemberForUid: (uid: Uid) => Member | undefined;
}
type Props = OwnProps & StateProps;

const OperationListComponent: React.StatelessComponent<Props> = props => {
  return (
    <OperationList>
      {props.operations.map(op => {
        switch (op.op_code) {
          case OperationType.REQUEST_INVITE: {
            const member = props.getMemberForUid(op.creator_uid);
            return member ? <RequestInvite fullName={member.fullName} /> : null;
          }
          case OperationType.TRUST: {
            const member = props.getMemberForUid(op.data.to_uid);
            return member ? <Trust fullName={member.fullName} /> : null;
          }
          case OperationType.MINT:
            return <Mint amount={op.data.amount} />;
          case OperationType.GIVE: {
            const member = props.getMemberForUid(op.data.to_uid);
            return member ? (
              <Give
                fullName={member.fullName}
                amount={op.data.amount}
                memo={op.data.memo}
              />
            ) : null;
          }

          default:
            return null;
        }
      })}
    </OperationList>
  );
};

/* ================
 * Redux container
 * ================
 */
const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state,
  ownProps
) => {
  return {
    getMemberForUid: (uid: Uid) => {
      const members = getMembersByUid(state, [uid]);
      if (members !== undefined && members.length === 1) {
        return members[0];
      } else {
        // tslint:disable-next-line:no-console
        console.warn(`Unable to find member with id ${uid}.`);
        return undefined;
      }
    }
  };
};

export default connect(mapStateToProps)(OperationListComponent);
