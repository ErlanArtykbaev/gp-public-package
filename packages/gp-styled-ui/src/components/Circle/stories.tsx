import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs/react';
import { ThemeProvider } from '../../index';
import { theme } from '../../theme';

import { Circle } from './Circle';
import { Icon } from '../Icon/Icon';

const stories = storiesOf('Circle', module);
stories.addDecorator(withKnobs);

const circleSizeList = {
  default: 'default',
  large: 'large',
  small: 'small',
};

const itemsList = {
  plus: '+',
};

stories.add('circle', () => (
  <ThemeProvider theme={theme}>
    <div style={{ display: 'flex' }}>
      <Circle size={select('size', circleSizeList, 'default')}>
        <Icon type="cogs" />
      </Circle>
    </div>
  </ThemeProvider>
));
