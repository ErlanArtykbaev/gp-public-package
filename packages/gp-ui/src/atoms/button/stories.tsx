import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs/react';

import Button from './index'

const stories = storiesOf('Atoms', module);
stories.addDecorator(withKnobs);

const buttonTypeList = {
  default: 'default',
  danger: 'danger',
  primary: 'primary',
}

const buttonSizeList = {
  large: 'large',
  small: 'small',
  default: 'default',
}

stories.add('button', () => (
  <Button
    onClick={action('clicked')}
    type={select('type', buttonTypeList, 'default')}
    size={select('size', buttonSizeList, 'default')}
    loading={boolean('loading', false)}
  >
    {text('Text', 'default')}
  </Button>
))
