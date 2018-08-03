import { Big } from "big.js";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

import { Button, ButtonType, ButtonSize } from "../../components/Button";
import { IntlMessage } from "../../components/IntlMessage";
import { Loading } from "../../components/Loading";

import { AppState } from "../../store";
import { mint } from "../../actions/wallet";
import { Member } from "../../reducers/membersNew";
import { ApiCallStatusType, ApiCallStatus } from "../../reducers/apiCalls";
import { getStatusOfApiCall } from "../../selectors/apiCalls";
import { getMemberMintableAmount } from "../../selectors/member";

interface OwnProps {
  loggedInMember: Member;
  inviteConfirmed: boolean;
}

interface StateProps {
  mintApiCallStatus?: ApiCallStatus;
  mintableAmount?: string;
}
interface DispatchProps {
  mint: typeof mint;
}
type MergedProps = StateProps & {
  mint?: () => void;
};

type Props = OwnProps & MergedProps;

const BasicIncomeView: React.StatelessComponent<Props> = props => {
  const { inviteConfirmed, loggedInMember, mintableAmount } = props;

  const mintApiCallStatus = props.mintApiCallStatus
    ? props.mintApiCallStatus.status
    : undefined;

  return (
    <section>
      <h2>
        <IntlMessage id="wallet.basicIncome.title" />
      </h2>
      <p>
        <IntlMessage id="wallet.basicIncome.detail" />
      </p>
      <p>
        <FormattedMessage
          id="wallet.basicIncome.lastMinted"
          values={{
            lastMintedDate: <b>{loggedInMember.lastMinted.toDateString()}</b>,
            lastMintedTime: <b>{loggedInMember.lastMinted.toTimeString()}</b>
          }}
        />
      </p>
      {mintableAmount !== "0" ? (
        <>
          <p>
            <FormattedMessage
              id="wallet.basicIncome.clickPrompt"
              values={{
                mintableAmount: <b>{mintableAmount}</b>
              }}
            />
          </p>
          {inviteConfirmed && props.mint ? (
            <Button
              size={ButtonSize.LARGE}
              type={ButtonType.PRIMARY}
              onClick={props.mint}
              disabled={
                mintApiCallStatus === ApiCallStatusType.STARTED ||
                mintableAmount === "0"
              }
            >
              {mintApiCallStatus === ApiCallStatusType.STARTED ? (
                <Loading />
              ) : (
                <IntlMessage
                  onlyRenderText={true}
                  id="wallet.basicIncome.mintButton"
                  values={{
                    mintableAmount
                  }}
                />
              )}
            </Button>
          ) : (
            <p>
              <IntlMessage
                id="wallet.basicIncome.inviteConfirmationRequired"
                className="inviteNotConfirmed"
              />
            </p>
          )}
        </>
      ) : (
        <p>
          <FormattedMessage id="wallet.basicIncome.alreadyClaimed" />
        </p>
      )}
    </section>
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
  const mintApiCallStatus = getStatusOfApiCall(
    state,
    ApiEndpointName.MINT,
    ownProps.loggedInMember.uid
  );

  const mintableAmount = getMemberMintableAmount(
    state,
    ownProps.loggedInMember.uid
  );

  return {
    mintApiCallStatus,
    mintableAmount
  };
};

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    mint: () => {
      if (stateProps.mintableAmount) {
        dispatchProps.mint(
          ownProps.loggedInMember.uid,
          new Big(stateProps.mintableAmount)
        );
      }
    },
    ...ownProps
  };
};

export const BasicIncome = connect(mapStateToProps, { mint }, mergeProps)(
  BasicIncomeView
);
