import * as React from 'react';
import { storiesOf } from '@storybook/react'
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';
import { State, Store} from '@sambego/storybook-state';
import { formatDate } from '@gostgroup/gp-utils/util';
import * as moment from 'moment';
const store = new Store({
  date: '20.11.2011',
});

import Datepicker from './index';

const stories = storiesOf('Atoms', module);
stories.addDecorator(withKnobs);
const dateFormat = "DD.MM.YYYY";

stories.add('datepicker', () => (
  <State store={store}>
    <Datepicker
      dateFormat={dateFormat}
      showTime={boolean('showTime', false)}
      onChange={(v) => {store.set({ date: moment(v).format(dateFormat) });}}
    />
  </State>
))
