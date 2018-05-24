import * as React from "react";
import { FormattedMessage, injectIntl, InjectedIntl } from "react-intl";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import styled from "styled-components";

import { ApiEndpoint } from "../../api";
import Button, { ButtonType, ButtonSize } from "../../components/Button";
import NumberInput from "../../components/NumberInput";
import TextInput from "../../components/TextInput";

import { AppState } from "../../store";
import { give } from "../../actions/money";
import { Member } from "../../reducers/membersNew";
import { ApiCallStatusType, ApiCallStatus } from "../../reducers/apiCalls";
import { getStatusOfApiCall } from "../../selectors/apiCalls";
import IntlMessage from "../../components/IntlMessage";

const MAX_MEMO_LENGTH = 140;

interface OwnProps {
  loggedInMember: Member;
  profileMember: Member;
}
interface InjectedProps {
  intl: InjectedIntl;
}

interface StateProps {
  giveApiCallStatus?: ApiCallStatus;
}
interface DispatchProps {
  give: typeof give;
}
type MergedProps = StateProps & {
  give?: (amount: string, memo?: string) => void;
};

type Props = OwnProps & InjectedProps & MergedProps;

interface FormFields {
  amount: string;
  memo: string;
}
type State = { readonly [field in keyof FormFields]?: FormFields[field] };

const GiveForm = styled.form`
  display: flex;
  flex-direction: column;

  .input {
    display: block;
    color: #333;
  }

  .inputBox {
    margin-left: 10px;
  }

  .inputHelper {
    color: #aaa;
    margin: 20px;
  }

  > *:not(:last-child) {
    margin-bottom: 20px;
  }
`;

class GiveView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      amount: "1"
    };
  }

  private handleChange(field: keyof FormFields) {
    return (value: string) => {
      this.setState({ [field]: value });
    };
  }

  private readonly handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { amount, memo } = this.state;

    if (this.props.give && amount) {
      this.props.give(amount, memo);
    }
  };

  private isFormValid() {
    if (this.state.memo && this.state.memo.length > MAX_MEMO_LENGTH) {
      return false;
    }

    try {
      return (
        this.state.amount &&
        this.props.loggedInMember.balance.gte(this.state.amount)
      );
    } catch (error) {
      return false;
    }
  }

  public render() {
    const { profileMember, intl } = this.props;
    const { amount, memo } = this.state;
    const giveApiCallStatus = this.props.giveApiCallStatus
      ? this.props.giveApiCallStatus.status
      : undefined;
    return (
      <section>
        <h2>Give Raha</h2>
        <p>
          <FormattedMessage
            id="money.give.detail"
            values={{
              fullName: <b>{profileMember.fullName}</b>,
              donationPercent: <b>3%</b>
            }}
          />
        </p>
        <GiveForm onSubmit={this.handleSubmit}>
          <label className="input">
            <IntlMessage id="money.give.amountLabel" />
            <NumberInput
              placeholder={intl.formatMessage({
                id: "money.give.amountPlaceholder"
              })}
              className="inputBox"
              onTextChange={this.handleChange("amount")}
              defaultValue={amount}
              step="0.01"
              min="0.01"
            />
          </label>
          <label className="input">
            <IntlMessage id="money.give.memoLabel" />
            <TextInput
              placeholder={intl.formatMessage({
                id: "money.give.memoPlaceholder"
              })}
              className="inputBox"
              onTextChange={this.handleChange("memo")}
            />
            <span className="inputHelper">
              <IntlMessage
                id="money.give.memoHelper"
                values={{
                  charactersRemaining:
                    MAX_MEMO_LENGTH - (memo ? memo.length : 0)
                }}
              />
            </span>
          </label>
          {this.props.give && (
            <Button
              size={ButtonSize.LARGE}
              type={ButtonType.PRIMARY}
              submit={true}
              disabled={
                giveApiCallStatus === ApiCallStatusType.STARTED ||
                !this.isFormValid()
              }
            >
              <IntlMessage
                onlyRenderText={true}
                id="money.give.giveButton"
                values={{
                  amount,
                  fullName: profileMember.fullName,
                  memo: memo ? ` ${memo}` : ""
                }}
              />
            </Button>
          )}
        </GiveForm>
      </section>
    );
  }
}

/* ================
 * Redux container
 * ================
 */

const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state,
  ownProps
) => {
  const giveApiCallStatus = getStatusOfApiCall(
    state,
    ApiEndpoint.GIVE,
    ownProps.profileMember.uid
  );

  return {
    giveApiCallStatus
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
    give: (amount: string, memo?: string) => {
      dispatchProps.give(ownProps.profileMember.uid, amount, memo);
    },
    ...ownProps
  };
};

export default connect(mapStateToProps, { give }, mergeProps)(
  injectIntl(GiveView)
);
