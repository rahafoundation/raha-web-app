import { Big } from "big.js";
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import styled from "styled-components";
import { green50 } from "material-ui/styles/colors";

import {
  Operation,
  OperationType
} from "@raha/api/dist/shared/models/Operation";

import { Uid } from "../identifiers";
import { AppState } from "../store";
import { Member } from "../reducers/membersNew";
import { getLoggedInMember } from "../selectors/auth";
import { getMembersByUid } from "../selectors/members";

import { IntlMessage } from "./IntlMessage";

// styling from: https://material-components.github.io/material-components-web-catalog/#/component/list
const OperationListElem = styled.ul`
  padding: 8px 0px;
  background-color: ${green50};
  border: 1px solid rgba(0, 0, 0, 0.1);

  > li {
    list-style-type: none;
    min-height: 48px;
    padding: 0px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    line-height: 1.48rem;

    .secondaryText {
      margin-left: 16px;
      color: #888;
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

/**
 * Eventually put operation list element template stuff here.
 */
const OperationListElement: React.StatelessComponent<any> = props => (
  <li>{props.children}</li>
);

interface RequestInviteProps {
  fromName: string;
  toName: string;
}
const RequestInvite: React.StatelessComponent<RequestInviteProps> = props => (
  <OperationListElement>
    <IntlMessage
      id="operationList.requestInvite"
      values={{
        fromName: <b>{props.fromName}</b>,
        toName: <b>{props.toName}</b>
      }}
    />
  </OperationListElement>
);

interface TrustProps {
  fromName: string;
  toName: string;
}
const Trust: React.StatelessComponent<TrustProps> = props => (
  <OperationListElement>
    <IntlMessage
      id="operationList.trust"
      values={{
        fromName: <b>{props.fromName}</b>,
        toName: <b>{props.toName}</b>
      }}
    />
  </OperationListElement>
);

interface MintProps {
  fromName: string;
  amount: string;
}
const Mint: React.StatelessComponent<MintProps> = props => (
  <OperationListElement>
    <IntlMessage
      id="operationList.mint"
      values={{
        fromName: <b>{props.fromName}</b>,
        amount: <b>{props.amount}</b>
      }}
    />
  </OperationListElement>
);

interface GiveProps {
  amount: string;
  fromName: string;
  toName: string;
  memo?: string;
}
const Give: React.StatelessComponent<GiveProps> = props => (
  <OperationListElement>
    <IntlMessage
      id="operationList.give"
      values={{
        amount: <b>{props.amount}</b>,
        fromName: <b>{props.fromName}</b>,
        toName: <b>{props.toName}</b>
      }}
    />
    {props.memo ? <span className="secondaryText">{props.memo}</span> : null}
  </OperationListElement>
);

interface OwnProps {
  operations: Operation[];
}
interface StateProps {
  loggedInMember: Member | undefined;
  getMemberForUid: (uid: Uid) => Member | undefined;
}
type Props = OwnProps & StateProps;

const OperationListView: React.StatelessComponent<Props> = props => {
  const { loggedInMember } = props;

  return (
    <OperationListElem>
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
    </OperationListElem>
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

export const OperationList = connect(mapStateToProps)(OperationListView);
