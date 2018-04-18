import * as React from "react";
import styledUntyped, { ThemedBaseStyledInterface } from "styled-components";

import { getAuthMemberDoc } from "../connectors";
import { interactive, gray } from "../constants/palette";
import { MemberDoc } from "../members";
import { getTrustOperation } from "../operations";
import { AppState } from "../store";
import { linkStyles } from "./Link";
import { white } from "material-ui/styles/colors";

// TODO code duplication in functions/srs/index.ts, decomp.

/* ================
 * Component types
 * ================
 */

/**
 * Expresses how prominently a button should be displayed.
 *
 * PRIMARY has high visual prominence
 * SECONDARY has lesser visual prominence
 * LINK is rendered similarly to a hyperlink.
 */
export enum ButtonType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  LINK = "link"
}

export enum ButtonSize {
  SMALL = "small",
  REGULAR = "regular",
  LARGE = "large"
}

interface BaseProps {
  type?: ButtonType;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  submit?: boolean;
}

// either have onClick or submit, but not both.
type ClickHandlerProps =
  | {
      onClick: () => void;
      submit?: false;
    }
  | {
      submit: true;
    };

type Props = BaseProps & ClickHandlerProps;

const buttonStyles = {
  background: {
    [ButtonType.PRIMARY]: interactive.primary,
    [ButtonType.SECONDARY]: interactive.secondary,
    [ButtonType.LINK]: "none",
    disabled: gray,
    disabledLink: "none"
  },
  color: {
    [ButtonType.PRIMARY]: white,
    [ButtonType.SECONDARY]: white,
    [ButtonType.LINK]: linkStyles.color,
    disabled: white,
    disabledLink: gray
  },
  size: {
    [ButtonSize.SMALL]: ".8rem",
    [ButtonSize.REGULAR]: "1rem",
    [ButtonSize.LARGE]: "1.2rem"
  },
  padding: {
    [ButtonSize.SMALL]: "5px 10px",
    [ButtonSize.REGULAR]: "7.5px 15px",
    [ButtonSize.LARGE]: "10px 20px"
  },
  textDecoration: {
    [ButtonType.LINK]: linkStyles.textDecoration
  },
  hover: {
    background: {
      [ButtonType.PRIMARY]: interactive.primaryHover,
      [ButtonType.SECONDARY]: interactive.secondaryHover,
      [ButtonType.LINK]: "none"
    },
    color: {
      [ButtonType.PRIMARY]: "white",
      [ButtonType.SECONDARY]: "white",
      [ButtonType.LINK]: linkStyles.hover.color
    },
    textDecoration: {
      [ButtonType.LINK]: linkStyles.hover.textDecoration
    }
  }
};

interface ThemeProps {
  type: ButtonType;
  size: ButtonSize;
}
const styled = styledUntyped as ThemedBaseStyledInterface<ThemeProps>;

const ButtonElem = styled.button`
  cursor: ${props => (props.disabled ? "not-allowed" : "pointer")};
  padding: ${props =>
    props.theme.type === ButtonType.LINK
      ? 0
      : buttonStyles.padding[props.theme.size]};
  border: none;
  border-radius: 2px;

  color: ${props =>
    props.disabled
      ? props.theme.type === ButtonType.LINK
        ? buttonStyles.color.disabledLink
        : buttonStyles.color.disabled
      : buttonStyles.hover.color[props.theme.type]};
  background: ${props =>
    props.disabled
      ? props.theme.type === ButtonType.LINK
        ? buttonStyles.background.disabledLink
        : buttonStyles.background.disabled
      : buttonStyles.hover.background[props.theme.type]};
  text-decoration: none;

  font-size: ${props => buttonStyles.size[props.theme.size]};
  font-weight: ${props =>
    props.theme.type === ButtonType.LINK ? linkStyles.fontWeight : "500"};

  transition: color 0.15s, text-decoration 0.15s, background-color 0.15s;

  :hover,
  :active,
  :focus {
    background: ${props =>
      props.disabled
        ? props.theme.type === ButtonType.LINK
          ? buttonStyles.background.disabledLink
          : buttonStyles.background.disabled
        : buttonStyles.background[props.theme.type]};
    color: ${props =>
      props.disabled
        ? props.theme.type === ButtonType.LINK
          ? buttonStyles.color.disabledLink
          : buttonStyles.color.disabled
        : buttonStyles.color[props.theme.type]};
    text-decoration: ${props =>
      props.theme.type === ButtonType.LINK
        ? buttonStyles.hover.textDecoration[props.theme.type]
        : "none"};
  }
`;

/**
 * General purpose button that matches application styles.
 * Not intended for webpage linking, but instead for running
 * code on click, or submitting forms.
 *
 * ================
 * Usage examples:
 * ================
 * Minimal:
 *   <Button onClick={() => alert("hi")}>Say Hi</Button>
 *
 * Displayed like a link:
 *   <Button type={ButtonTypes.LINK} onClick={() => alert("hi")}>Say Hi</Button>
 *
 * Displayed large:
 *   <Button size={ButtonTypes.LARGE} onClick={() => alert("hi")}>Say Hi</Button>
 *
 * Disabled:
 *   <Button disabled={true} onClick={() => alert("hi")}>Say Hi</Button>
 *
 * As <input type="submit" />:
 *   <Button submit={true}>Submit</Button>
 */
const Button: React.StatelessComponent<Props> = props => {
  const { className, style, children } = props;
  const type = props.type ? props.type : ButtonType.PRIMARY;
  const size = props.size ? props.size : ButtonSize.REGULAR;
  const disabled = props.disabled ? props.disabled : false;
  const submit = !!props.submit;

  return (
    <ButtonElem
      {...("onClick" in props
        ? {
            onClick: e => {
              e.preventDefault();
              props.onClick();
            }
          }
        : {})}
      {...(submit ? { type: "submit" } : {})}
      className={className}
      style={style}
      theme={{ type, size }}
      disabled={disabled}
    >
      {children}
    </ButtonElem>
  );
};
export default Button;
