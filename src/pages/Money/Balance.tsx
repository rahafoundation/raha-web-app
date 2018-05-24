import IntlMessage from "../../components/IntlMessage";
import * as React from "react";

interface OwnProps {
  memberBalance: string;
}

type Props = OwnProps;

const BalanceView: React.StatelessComponent<Props> = props => {
  return (
    <section>
      <h2>
        <IntlMessage
          id="money.balance.message"
          values={{ balance: props.memberBalance }}
        />
      </h2>
    </section>
  );
};

export default BalanceView;
