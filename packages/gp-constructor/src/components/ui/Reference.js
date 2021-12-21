import React, { Component, PropTypes } from 'react';
import Select from 'react-select';

export default class ReferenceInput extends Component {

  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    ignorePath: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  };

  static get defaultProps() {
    return {
      label: 'Справочник',
      disabled: false,
    };
  }

  static contextTypes = {
    container: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.handleSelectChange = this.handleSelectChange.bind(this);

    this.state = {
      refs: context.container.refs,
    };
  }

  componentDidMount() {
    const { value } = this.props;
    const { refs } = this.state;

    if (value === undefined && refs.get(0) !== undefined) {
      const defaultValue = refs.get(0).get('id');
      const defaultLabel = refs.get(0).get('title');
      this.props.onChange(defaultValue, defaultLabel);
    }
  }

  render() {
    const { props, state } = this;
    const { refs } = state;

    let options = refs.toJS();
    if (props.ignorePath) {
      options = options.filter(({ id }) => (id.substr(0, props.ignorePath.length) !== props.ignorePath));
    }
    options = options.map(({ id, title }) => ({ value: id, label: title }));

    return (
      <div>
        <label className="control-label">{this.props.label}</label>
        <Select
          value={props.value}
          options={options}
          clearValueText="Очистить поле"
          clearAllText="Очистить поле"
          noResultsText="Не найдено"
          onChange={this.handleSelectChange}
          disabled={props.disabled}
          placeholder="Выберите справочник"
        />
      </div>
    );
  }

  handleSelectChange(id, options) {
    this.props.onChange(id, options && options[0] && options[0].label);
  }
}
