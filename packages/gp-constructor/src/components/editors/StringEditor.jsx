import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Input from '../ui/Input';
import PrimitiveEditor from './PrimitiveEditor';

@autobind
export default class StringEditor extends React.Component {

  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  constructor() {
    super();

    this.state = {};
  }

  handleChange = field => (value) => {
    this.props.onChange(this.props.value.set(field, value));
  }

  render() {
    const typeConfig = this.props.value;
    const isText = typeConfig.get('isText'); // (для строк) использовать ли textarea
    const defaultValue = typeConfig.get('defaultValue');

    return (
      <div>
        <Input
          type="bool"
          value={isText}
          label="Текст"
          onChange={this.handleChange('isText')}
        />
        <Input
          type="text"
          value={defaultValue}
          label="Значение по умолчанию"
          onChange={this.handleChange('defaultValue')}
        />
        <PrimitiveEditor {...this.props} />
      </div>
    );
  }

}
