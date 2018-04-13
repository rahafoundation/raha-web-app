import * as React from "react";
import styledUntyped, { ThemedBaseStyledInterface } from "styled-components";

import { postOperation } from "../actions";
import { getAuthMemberDoc } from "../connectors";
import { interactive } from "../constants/palette";
import { MemberDoc } from "../members";
import { getTrustOperation } from "../operations";
import { AppState } from "../store";
import { linkStyles } from "./Link";

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
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  LINK = 'link'
}

export enum ButtonSize {
  SMALL = 'small',
  REGULAR = 'regular',
  LARGE = 'large'
}

interface Props {
  type?: ButtonType
  size?: ButtonSize
  children: React.ReactNode
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

const buttonStyles = {
  background: {
    [ButtonType.PRIMARY]: interactive.primary,
    [ButtonType.SECONDARY]: interactive.secondary,
    [ButtonType.LINK]: "none"
  },
  color: {
    [ButtonType.PRIMARY]: "white",
    [ButtonType.SECONDARY]: "white",
    [ButtonType.LINK]: linkStyles.color
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
}

interface ThemeProps {
  type: ButtonType;
  size: ButtonSize;
}
const styled = styledUntyped as ThemedBaseStyledInterface<ThemeProps>
const ButtonElem = styled.button`
  cursor: pointer;
  padding: ${props => props.theme.type === ButtonType.LINK ?
    0 : buttonStyles.padding[props.theme.size]
  };
  border: none;
  border-radius: 2px;

  color: ${props => buttonStyles.color[props.theme.type]};
  background: ${props => buttonStyles.background[props.theme.type]};
  text-decoration: none;

  font-size: ${props => buttonStyles.size[props.theme.size]};
  font-weight: ${props => props.theme.type === ButtonType.LINK ?
    linkStyles.fontWeight : "500"
  };

  transition: color 0.15s, text-decoration 0.15s, background-color 0.15s;

  :hover,
  :active,
  :focus {
    background: ${props => buttonStyles.hover.background[props.theme.type]};
    color: ${props => buttonStyles.hover.color[props.theme.type]}
    text-decoration: ${props =>
      props.theme.type === ButtonType.LINK ?
        buttonStyles.hover.textDecoration[props.theme.type] : "none"
    };
  }
`;

/**
 * General purpose button that matches application styles.
 * Not intended for webpage linking, but instead for running
 * code on click.
 */
const Button: React.StatelessComponent<Props> = (props) => {
  const {
    className, style, onClick, children
  } = props;
  const type = props.type ? props.type : ButtonType.PRIMARY;
  const size = props.size ? props.size : ButtonSize.REGULAR;

  return (
    <ButtonElem
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={className}
      style={style}
      theme={{type, size}}
    >
      {children}
    </ButtonElem>
  );
}
export default Button;
