import Big from "big.js";
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import styled from "styled-components";
import { green50 } from "material-ui/styles/colors";

import { Uid } from "../identifiers";
import { AppState } from "../store";
import { Member } from "../reducers/membersNew";
import { Operation, OperationType } from "../reducers/operations";
import { getLoggedInMember } from "../selectors/auth";
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

    .operationText {
      display: flex;
      flex-direction: column;
      line-height: 1.48rem;
      justify-content: center;

      .secondaryText {
        margin-left: 16px;
        color: #888;
      }
    }
  }
`;

function getNameForMember(
  member: Member,
  loggedInMember: Member | undefined
): string {
  if (loggedInMember && member.uid === loggedInMember.uid) {
    return "You";
  } else {
    return member.fullName;
  }
}

function getDisplayAmount(
  amount: string,
  involvedMembers: Member[],
  loggedInMember: Member | undefined
): string {
  if (loggedInMember) {
    for (const i in involvedMembers) {
      if (involvedMembers[i].uid === loggedInMember.uid) {
        return ` ${amount}`;
      }
    }
  }
  return "";
}

interface RequestInviteProps {
  fromName: string;
  toName: string;
}
const RequestInvite: React.StatelessComponent<RequestInviteProps> = props => (
  <li>
    <span className="operationText">
      <IntlMessage
        id="operationList.requestInvite"
        values={{
          fromName: <b>{props.fromName}</b>,
          toName: <b>{props.toName}</b>
        }}
      />
    </span>
  </li>
);

interface TrustProps {
  fromName: string;
  toName: string;
}
const Trust: React.StatelessComponent<TrustProps> = props => (
  <li>
    <span className="operationText">
      <IntlMessage
        id="operationList.trust"
        values={{
          fromName: <b>{props.fromName}</b>,
          toName: <b>{props.toName}</b>
        }}
      />
    </span>
  </li>
);

interface MintProps {
  fromName: string;
  amount: string;
}
const Mint: React.StatelessComponent<MintProps> = props => (
  <li>
    <span className="operationText">
      <IntlMessage
        id="operationList.mint"
        values={{
          fromName: <b>{props.fromName}</b>,
          amount: <b>{props.amount}</b>
        }}
      />
    </span>
  </li>
);

interface GiveProps {
  amount: string;
  fromName: string;
  toName: string;
  memo?: string;
}
const Give: React.StatelessComponent<GiveProps> = props => (
  <li>
    <span className="operationText">
      <IntlMessage
        id="operationList.give"
        values={{
          amount: <b>{props.amount}</b>,
          fromName: <b>{props.fromName}</b>,
          toName: <b>{props.toName}</b>
        }}
      />
      {props.memo ? <span className="secondaryText">{props.memo}</span> : null}
    </span>
  </li>
);

interface OwnProps {
  operations: Operation[];
}
interface StateProps {
  loggedInMember: Member | undefined;
  getMemberForUid: (uid: Uid) => Member | undefined;
}
type Props = OwnProps & StateProps;

const OperationListComponent: React.StatelessComponent<Props> = props => {
  const { loggedInMember } = props;

  return (
    <OperationList>
      {props.operations.map(op => {
        const fromMember = props.getMemberForUid(op.creator_uid);
        if (!fromMember) {
          return null;
        }
        const fromName = getNameForMember(fromMember, loggedInMember);

        switch (op.op_code) {
          case OperationType.REQUEST_INVITE: {
            const toMember = props.getMemberForUid(op.data.to_uid);
            return toMember ? (
              <RequestInvite
                fromName={fromName}
                toName={getNameForMember(toMember, loggedInMember)}
              />
            ) : null;
          }
          case OperationType.TRUST: {
            const toMember = props.getMemberForUid(op.data.to_uid);
            return toMember ? (
              <Trust
                fromName={fromName}
                toName={getNameForMember(toMember, loggedInMember)}
              />
            ) : null;
          }
          case OperationType.MINT:
            return (
              <Mint
                fromName={fromName}
                amount={getDisplayAmount(
                  op.data.amount,
                  [fromMember],
                  loggedInMember
                )}
              />
            );
          case OperationType.GIVE: {
            const toMember = props.getMemberForUid(op.data.to_uid);
            const amount = new Big(op.data.amount)
              .plus(op.data.donation_amount)
              .toString();
            return toMember ? (
              <Give
                fromName={fromName}
                toName={getNameForMember(toMember, loggedInMember)}
                amount={getDisplayAmount(
                  amount,
                  [fromMember, toMember],
                  loggedInMember
                )}
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
    loggedInMember: getLoggedInMember(state),
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
