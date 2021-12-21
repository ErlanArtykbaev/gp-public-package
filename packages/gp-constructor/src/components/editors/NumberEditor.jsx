import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Input from '../ui/Input';
import PrimitiveEditor from './PrimitiveEditor';

@autobind
export default class NumberEditor extends React.Component {

  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    type: PropTypes.string,
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
    const min = typeConfig.get('min');
    const max = typeConfig.get('max');
    const defaultValue = typeConfig.get('defaultValue');
    const isInteger = this.props.type === 'integer';

    return (
      <div>
        <PrimitiveEditor {...this.props} />
        <Input
          label="Минимальное значение"
          type="number"
          integer={isInteger}
          value={min}
          onChange={this.handleChange('min')}
        />
        <Input
          label="Максимальное значение"
          type="number"
          integer={isInteger}
          value={max}
          onChange={this.handleChange('max')}
        />
        <Input
          label="Значение по умолчанию"
          type="number"
          integer={isInteger}
          value={defaultValue}
          onChange={this.handleChange('defaultValue')}
        />
      </div>
    );
  }

}
