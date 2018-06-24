import { getColor } from "random-material-color";
import * as React from "react";
import styled, { ThemeProvider } from "styled-components";

import { Link } from "../../components/Link";

import { Member } from "../../reducers/membersNew";

import { interactive, lightGreen } from "../../constants/palette";

interface Props {
  member: Member;
}

// TODO generalize some of these styles into a link type
const MemberThumbnailElem = styled(Link)`
  display: flex;
  width: 200px;
  align-items: center;
  justify-content: flex-start;
  border-radius: 3px;
  transition: background-color 0.05s, color 0.05s;

  :hover,
  :focus,
  :active {
    background: ${interactive.primary};
    color: white;
  }

  > * {
    margin: 0.25rem;
  }

  /* custom behavior to handle underline properly with initials display */
  :hover,
  :active,
  :focus {
    text-decoration: none;
  }

  > .thumbnailImage {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 50px;
    height: 50px;
    border-radius: 3px;

    background: ${props => props.theme.thumbnailBackgroundColor};
    color: white;
    font-size: 1.3rem;
  }
`;
MemberThumbnailElem.defaultProps = {
  theme: {
    thumbnailBackgroundColor: lightGreen
  }
};

/**
 * Turns a name into initials, capped at a length of 3.
 * TODO: Just takes max the first 3 initials; this is probably improvable.
 */
function getInitialsForName(name: string): string {
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .slice(0, 3)
    .join("")
    .toUpperCase();
}

// TODO(#14) improve this thumbnail
const MemberThumbnail: React.StatelessComponent<Props> = ({ member }) => {
  const backgroundColor = getColor({
    text: `${member.username}${member.fullName}`
  });
  return (
    <ThemeProvider theme={{ thumbnailBackgroundColor: backgroundColor }}>
      <MemberThumbnailElem to={`/m/${member.username}`}>
        {/* TODO: if thumbnail image exists, show that instead of initials */}
        <span className="thumbnailImage">
          {getInitialsForName(member.fullName)}
        </span>
        <span className="memberName">{member.fullName}</span>
      </MemberThumbnailElem>
    </ThemeProvider>
  );
};
export { MemberThumbnail };
