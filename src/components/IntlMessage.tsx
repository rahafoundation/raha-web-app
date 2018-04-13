import * as React from "react";
import * as ReactDOM from "react-dom";
import { FormattedMessage, MessageValue } from "react-intl";

interface BaseProps {
  id: string;
  values?: { [key: string]: MessageValue | JSX.Element };
}

type ClassNameRenderers = { className?: string } & ({
  tagName?: keyof JSX.IntrinsicElements;
});
type IndependentRenderers =
  | { onlyRenderText: boolean }
  | { render: (message: string[]) => React.ReactNode };

type Props =
  | BaseProps
  | (BaseProps & (ClassNameRenderers | IndependentRenderers));

const IntlMessage: React.StatelessComponent<Props> = props => {
  const baseProps = {
    id: props.id,
    ...("values" in props ? { values: props.values } : {})
  };
  return (
    <FormattedMessage {...baseProps}>
      {(message: string[]) => {
        if ("onlyRenderText" in props && props.onlyRenderText) {
          return message;
        }
        if ("render" in props) {
          return props.render(message);
        }
        const tagName =
          "tagName" in props && props.tagName !== undefined
            ? props.tagName
            : "span";
        const className = "className" in props ? props.className : undefined;
        return React.createElement(tagName, { className });
      }}
    </FormattedMessage>
  );
};

export default IntlMessage;
