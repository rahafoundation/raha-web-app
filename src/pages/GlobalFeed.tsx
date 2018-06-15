import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import styled from "styled-components";
import { green100 } from "material-ui/styles/colors";

import { AppState } from "../store";
import { Member } from "../reducers/membersNew";
import { Operation, OperationType } from "../reducers/operations";

import { IntlMessage } from "../components/IntlMessage";
import { OperationList } from "../components/OperationList";

/* ==================
 * Styled components
 * ==================
 */
const FeedElem = styled.main`
  padding: 0 20px;
  margin-bottom: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;

  > main {
    max-width: 768px;

    > section {
      padding: 20px;
      margin: 20px;
      background-color: ${green100};
      border-radius: 2px;
      box-shadow:
        0px 1px 5px 0px rgba(0, 0, 0, 0.2),
        0px 2px 2px 0px rgba(0, 0, 0, 0.14),
        0px 3px 1px -2px rgba(0, 0, 0, 0.12);
    }
  }
}
`;

interface OwnProps {
  loggedInMember: Member;
}

interface StateProps {
  operations: Operation[];
}

type Props = OwnProps & StateProps;

const GlobalFeedView: React.StatelessComponent<Props> = props => {
  const { operations } = props;
  return (
    <FeedElem>
      <section>
        <h1>
          <IntlMessage id="globalFeed.header" />
        </h1>
        <OperationList operations={operations.reverse()} />
      </section>
    </FeedElem>
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
    operations: state.operations
  };
};

export const GlobalFeed = connect(mapStateToProps)(GlobalFeedView);
