import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";

import { interactive } from "../constants/palette";

export const linkStyles = {
  color: interactive.primary,
  textDecoration: "none",
  fontWeight: "700",
  hover: {
    color: interactive.primaryHover,
    textDecoration: "underline"
  }
};

/**
 * Utility component for a link to another page or
 * website.
 *
 * TODO: make this smart enough to handle internal seamless react-router links,
 * vs external traditional page-refresh linking with `a` elements.
 */
const Link = styled(RouterLink)`
  color: ${props => (props.color ? props.color : linkStyles.color)};
  font-weight: ${linkStyles.fontWeight};
  text-decoration: ${linkStyles.textDecoration};

  :hover,
  :focus,
  :active {
    color: ${interactive.primaryHover}
    text-decoration: ${linkStyles.textDecoration};
  }
`;

export default Link;
