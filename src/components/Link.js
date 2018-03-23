import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

import { interactive } from '../constants/palette';

const Link = styled(RouterLink)`
  color: ${props => props.color ? props.color : interactive.primary};
  font-weight: bold;
  text-decoration: none;

  :hover, :focus, :active {
    text-decoration: underline;
  }
`;

export default Link;
