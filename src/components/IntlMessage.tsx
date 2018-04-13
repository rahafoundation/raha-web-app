import * as React from "react";
import * as ReactDOM from "react-dom";
import { FormattedMessage, MessageValue } from "react-intl";

interface BaseProps {
  id: string;
  values?: { [key: string]: MessageValue | JSX.Element };
}

type RenderByTagNameProps = BaseProps & {
  className?: string;
  tagName?: keyof JSX.IntrinsicElements;
};

type RenderTextProps = BaseProps & { onlyRenderText: boolean };
type CustomRenderProps = BaseProps & {
  render: (message: string[]) => React.ReactNode;
};

type Props = RenderByTagNameProps | RenderTextProps | CustomRenderProps;

/**
 * Neat component for rendering internationalized text in a variety of ways.
 *
 * react-intl's FormattedMessage class does everything we need, but the syntax
 * for rendering in various ways is not always straightforward.
 */
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
