import * as React from "react";
import { FormattedMessage } from "react-intl";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import Button, { ButtonType, ButtonSize } from "../../components/Button";
import IntlMessage from "../../components/IntlMessage";
import Loading from "../../components/Loading";
import { ApiEndpoint } from "../../api";

import { AppState } from "../../store";
import { mint } from "../../actions/money";
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
        <IntlMessage id="money.basicIncome.title" />
      </h2>
      <p>
        <IntlMessage id="money.basicIncome.detail" />
      </p>
      <p>
        <FormattedMessage
          id="money.basicIncome.lastMinted"
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
              id="money.basicIncome.clickPrompt"
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
                  id="money.basicIncome.mintButton"
                  values={{
                    mintableAmount
                  }}
                />
              )}
            </Button>
          ) : (
            <p>
              <IntlMessage
                id="money.basicIncome.inviteConfirmationRequired"
                className="inviteNotConfirmed"
              />
            </p>
          )}
        </>
      ) : (
        <p>
          <FormattedMessage id="money.basicIncome.alreadyClaimed" />
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
    ApiEndpoint.MINT,
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
      dispatchProps.mint(
        ownProps.loggedInMember.uid,
        stateProps.mintableAmount
      );
    },
    ...ownProps
  };
};

export default connect(mapStateToProps, { mint }, mergeProps)(BasicIncomeView);
