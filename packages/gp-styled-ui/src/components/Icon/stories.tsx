import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs/react';
import { ThemeProvider, theme } from '../../index';

import { Icon } from './Icon';

const stories = storiesOf('Icon', module);
stories.addDecorator(withKnobs);

const iconTypeList = {
  users: 'users',
  handshake: 'handshake',
  cogs: 'cogs',
};

stories.add('icon', () => (
  <ThemeProvider theme={theme}>
    <div style={{ display: 'flex' }}>
      <Icon type="cogs" />
    </div>
  </ThemeProvider>
));
