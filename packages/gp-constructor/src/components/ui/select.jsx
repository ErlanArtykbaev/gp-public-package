import React, { PropTypes } from 'react';
import Select from 'react-select';
import Immutable from 'immutable';
import cx from 'classnames';
import styles from './select.scss';

const localeProps = {
  placeholder: 'Выберите значение из списка...',
  noResultsText: 'Ничего не найдено',
  searchPromptText: 'Введите строку для поиска',
  searchingText: 'Поиск',
  clearValueText: 'Очистить',
};

// TODO сделать нормальный селект без иммьютбл, ало
export default class EditorSelect extends React.Component {

  static propTypes = {
    error: PropTypes.string,
    value: PropTypes.any,
    label: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({})),
    disabled: PropTypes.bool,
    multi: PropTypes.bool,
    onChange: PropTypes.func,
    className: PropTypes.string,
  }

  static defaultProps = {
    className: styles.select,
  }

  onChange(value) {
    this.props.onChange(this.immutableMode() ? new Immutable.List(value) : value);
  }

  immutableMode() {
    return Immutable.List.isList(this.props.value);
  }

  renderMultiSelect() {
    const { onChange, options, label, value } = this.props;
    const arrValue = this.immutableMode() ? value.toJS() : value;
    return (
      <div>
        <label className="control-label">{label}</label>
        <Select
          multi
          value={[].concat(arrValue || []).join(',')}
          className={styles.select}
          onChange={strValue => onChange(strValue.split(','))}
          options={options}
          {...localeProps}
        />
      </div>
    );
  }

  render() {
    const { error, value, label, options, disabled, multi, className } = this.props;
    const wrapperClassName = cx('form-group', { 'has-error': error });

    if (multi) {
      return this.renderMultiSelect();
    }

    return (
      <div className={wrapperClassName}>
        {!!label && <label className="control-label">{label}</label>}
        <Select
          className={className}
          options={options}
          onChange={this.onChange.bind(this)}
          disabled={disabled}
          value={value}
          {...localeProps}
        />
        <span className="help-block">{error}</span>
      </div>
    );
  }
}
