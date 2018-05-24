/**
 * A styled NumberInput.
 */
import * as React from "react";
import styled from "styled-components";

const NumberInputElem = styled.input`
  font-size: 1rem;
  padding: 10px 20px;
  border: 1px solid #737373;
  border-radius: 2px;
`;

type SimpleEventHandler = (value: string) => void;
type Props = {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  className?: string;
  step?: string;
  min?: string;
  max?: string;
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

const NumberInput: React.StatelessComponent<Props> = props => {
  const { placeholder, value, style, className, step, min, max } = props;
  const finalProps = {
    placeholder,
    value,
    style,
    className,
    step,
    min,
    max,
    type: "number",
    onChange:
      "onChange" in props ? props.onChange : handleChange(props.onTextChange),
    ...("defaultValue" in props ? { defaultValue: props.defaultValue } : {})
  };
  return <NumberInputElem {...finalProps} />;
};

export default NumberInput;
