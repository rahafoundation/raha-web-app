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
  render: (...message: Array<string | JSX.Element>) => React.ReactNode;
};

type Props = RenderByTagNameProps | RenderTextProps | CustomRenderProps;

/**
 * Neat component for rendering internationalized text in a variety of ways.
 *
 * react-intl's FormattedMessage class does everything we need, but the syntax
 * for rendering in various ways is not always straightforward.
 *
 * ================
 * Usage examples:
 * ================
 * Display a message:
 *   <IntlMessage id="message.hi" />
 *
 * ... in a list element:
 *   <IntlMessage id="message.hi" tagName="h2" />
 *
 * ... only text, without a wrapping html element:
 *   <IntlMessage id="message.hi" onlyRenderText={true} />
 *
 * ... with a variable value:
 *   <IntlMessage id="message.greeting", values={{greeting: "hi"}}  />
 *
 * ... with a custom rendering function, on a message with only one part:
 *   import Greeting from "./components/Greeting";
 *   <IntlMessage id="message.hi" render={(name) => <Greeting name={name} />
 *
 * ... with a custom rendering function, on a message with many parts:
 *   <IntlMessage id="message.hi" render={(...messages) =>
 *     messages.map((msg, idx) => <p key="idx">{msg}</p>)
 *   />
 */
const IntlMessage: React.StatelessComponent<Props> = props => {
  const baseProps = {
    id: props.id,
    ...("values" in props ? { values: props.values } : {})
  };
  return (
    <FormattedMessage {...baseProps}>
      {(...message) => {
        if ("onlyRenderText" in props && props.onlyRenderText) {
          return message;
        }
        if ("render" in props) {
          return props.render(...message);
        }

        const tagName =
          "tagName" in props && props.tagName !== undefined
            ? props.tagName
            : "span";

        const attributes =
          "className" in props && props.className !== undefined
            ? { className: props.className }
            : {};
        return React.createElement(tagName, attributes, ...message);
      }}
    </FormattedMessage>
  );
};

export default IntlMessage;
