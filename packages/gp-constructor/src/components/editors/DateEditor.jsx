import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Input from '../ui/Input';

@autobind
export default class DateEditor extends React.Component {

  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  constructor() {
    super();

    this.state = {
      regexpError: null,
      testError: null,
    };
  }

  handleChange = field => (value) => {
    this.props.onChange(this.props.value.set(field, value));
  }

  render() {
    const typeConfig = this.props.value;
    const specifyTime = typeConfig.get('time');

    return (
      <div>
        <Input
          label='Указывать время'
          type='bool'
          value={specifyTime}
          onChange={this.handleChange('time')}
        />
      </div>
    );
  }
}
