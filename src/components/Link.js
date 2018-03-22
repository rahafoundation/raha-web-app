import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

import { green } from '../constants/palette';

const Link = styled(RouterLink)`
  color: ${props => props.color ? props.color : green};
  font-weight: bold;
  text-decoration: none;

  :hover, :focus, :active {
    text-decoration: underline;
  }
`;

export default Link;
