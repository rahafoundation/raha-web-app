import * as React from "react";
import { FormattedMessage } from "react-intl";

import Button, { ButtonType, ButtonSize } from "../../components/Button";
import IntlMessage from "../../components/IntlMessage";
import Loading from "../../components/Loading";
import { ApiCallStatusType, ApiCallStatus } from "../../reducers/apiCalls";
import { Member } from "../../reducers/membersNew";

interface OwnProps {
  loggedInMember: Member;
  mintableAmount: string;
  inviteConfirmed: boolean;
  mintApiCallStatus: ApiCallStatusType | undefined;
  mint: () => void;
}

type Props = OwnProps;

const BasicIncomeView: React.StatelessComponent<Props> = props => {
  const {
    inviteConfirmed,
    loggedInMember,
    mintableAmount,
    mintApiCallStatus
  } = props;
  return (
    <section>
      <h2>
        <IntlMessage id="money.basicIncomeTitle" />
      </h2>
      <p>
        <IntlMessage id="money.basicIncomeDetail" />
      </p>
      <p>
        <FormattedMessage
          id="money.basicIncomeLastMinted"
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
              id="money.basicIncomeClickPrompt"
              values={{
                mintableAmount: <b>{mintableAmount}</b>
              }}
            />
          </p>
          {inviteConfirmed ? (
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
                  id="money.mintButton"
                  values={{
                    mintableAmount
                  }}
                />
              )}
            </Button>
          ) : (
            <p>
              <IntlMessage
                id="money.basicIncomeInviteConfirmationRequired"
                className="inviteNotConfirmed"
              />
            </p>
          )}
        </>
      ) : (
        <p>
          <FormattedMessage id="money.basicIncomeAlreadyClaimed" />
        </p>
      )}
    </section>
  );
};

export default BasicIncomeView;
