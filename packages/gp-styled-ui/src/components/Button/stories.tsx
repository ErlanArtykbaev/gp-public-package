import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs/react';
import { ThemeProvider } from '../../index';
import { theme } from '../../theme';

import { Button } from './Button';
const stories = storiesOf('Button', module);
stories.addDecorator(withKnobs);

const buttonSizeList = {
  default: 'default',
  large: 'large',
  small: 'small',
};

stories.add('button', () => (
  <ThemeProvider theme={theme}>
    <div style={{ display: 'flex' }}>
      <Button onClick={() => console.log('click')} size={select('size', buttonSizeList, 'default')}>
        {text('text', 'Default')}
      </Button>
      <Button size={select('size', buttonSizeList, 'default')} type="primary">
        Primary
      </Button>
      <Button size={select('size', buttonSizeList, 'default')} type="danger">
        Danger
      </Button>
    </div>
  </ThemeProvider>
));
