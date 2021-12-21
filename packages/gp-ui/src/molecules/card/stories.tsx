import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, text, object } from '@storybook/addon-knobs/react'

import Card from './index'

const stories = storiesOf('Molecules', module)

stories.addDecorator(withKnobs)

stories.add('card', () => (
  <Card
    title={text('Title', 'Title')}
    submitButton={text('SubmitText', 'Сохранить')}
    cancelButton={text('CancelText', 'Отменить')}
    style={object('Style', { width: '250px' })}
  >
    {text('Text', 'рандомный текст')}
  </Card>
))
