import * as React from 'react';
import { storiesOf } from '@storybook/react'
import { withKnobs, text } from '@storybook/addon-knobs/react';

import Header from './index';

const stories = storiesOf('Atoms', module);
stories.addDecorator(withKnobs);

stories.add('header', () => (
    <Header>{text('Text', 'Header')}</Header>
))