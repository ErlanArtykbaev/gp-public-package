import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Select from 'react-select';
import Input from '../ui/Input';

@autobind
export default class ClassifierEditor extends React.Component {

  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    label: PropTypes.string,
    disabled: PropTypes.bool,
  }

  static contextTypes = {
    container: PropTypes.shape({
      refs: PropTypes.shape({}),
    }),
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
    const classifierKey = typeConfig.get('key');
    const { refs } = this.context.container;
    const options = refs.toJS()
      .filter(item => item.type === 'classifier')
      .map(({ id, title }) => ({ value: id, label: title }));

    return (
      <div>
        <div>
          <label className="control-label">{this.props.label}</label>
          <Select
            value={classifierKey}
            options={options}
            onChange={this.handleChange('key')}
            disabled={this.props.disabled}
            placeholder={'Выберите классификатор'}
            noResultsText={'Ничего не найдено'}
            searchPromptText={'Введите строку для поиска'}
            searchingText={'Поиск'}
            clearValueText={'Очистить'}
          />
          <Input
            type="bool"
            value={typeConfig.get('inlineEditable')}
            label="Вложенное редактирование"
            onChange={this.handleChange('inlineEditable')}
          />
        </div>
      </div>
    );
  }

}
