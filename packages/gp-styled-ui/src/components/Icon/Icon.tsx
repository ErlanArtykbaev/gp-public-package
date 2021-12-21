import * as React from 'react';
import fontawesome, { IconName } from '@fortawesome/fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import regular from '@fortawesome/fontawesome-pro-regular';

fontawesome.library.add(regular);

export interface IconProps {
  type: IconName;
}
export class Icon extends React.PureComponent<IconProps> {
  render() {
    return <FontAwesomeIcon icon={['far', this.props.type]} />;
  }
}
