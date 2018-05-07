/**
 * A styled TextInput. Only supported the props I was using, if you need more
 * feel free to expand this.
 */
import * as React from "react";
import styled from "styled-components";

const TextInputElem = styled.input`
  padding: 5px 10px;
  border: 1px solid gray;
  border-radius: 2px;
`;

type SimpleEventHandler = (value: string) => void;
type Props = {
  placeholder?: string;
  value?: string;
  className?: string;
  style?: React.CSSProperties;
} & (
  | {
      onChange: React.EventHandler<React.FormEvent<HTMLInputElement>>;
    }
  | {
      onTextChange: SimpleEventHandler;
    });

const handleChange: (
  handler: SimpleEventHandler
) => React.EventHandler<React.FormEvent<HTMLInputElement>> = handler => e =>
  handler(e.currentTarget.value);

const TextInput: React.StatelessComponent<Props> = props => {
  const { placeholder, value, style, className } = props;
  const finalProps = {
    type: "text",
    placeholder,
    value,
    style,
    className,
    onChange:
      "onChange" in props ? props.onChange : handleChange(props.onTextChange)
  };
  return <TextInputElem {...finalProps} />;
};

export default TextInput;
