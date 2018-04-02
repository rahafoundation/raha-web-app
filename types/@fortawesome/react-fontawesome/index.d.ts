declare module '@fortawesome/react-fontawesome' {
  import { Component } from 'react';
  import { IconDefinition } from '@fortawesome/fontawesome-common-types';

  type FontAwesomeIconProps = {
    icon: string | IconDefinition;
    className?: string;
  }

  class FontAwesomeIcon extends Component<FontAwesomeIconProps> { }
  const iconComponent: typeof FontAwesomeIcon
  export = iconComponent
}