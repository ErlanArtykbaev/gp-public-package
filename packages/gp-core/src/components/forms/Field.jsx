import React, { Component } from 'react';
import Select from '@gostgroup/gp-constructor/lib/components/ui/select';
import DatePicker from '@gostgroup/gp-ui-components/lib/DatePicker';
import styles from './field.scss';

// TODO  проверка на тип при вызове функции
export default class Field extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  onFileChange(e, a) {
    this.props.onChange(e.target.files[0]);
  }

  onChange(e) {
    this.props.onChange(e.target.value);
  }

  text({ size, value, disabled }) {
    return (<input
      className="form-control" type="text"
      onChange={this.onChange}
      value={value}
      disabled={disabled} max={this.props.max}
    />);
  }

  file({ size, value, disabled, fileTypes, onChange }) {
    return <input type="file" accept={fileTypes} onChange={onChange} value={value} disabled={disabled} />;
  }

  number({ size, value, disabled }) {
    return (<input
      type="number" className="form-control"
      onChange={this.onChange} value={value} min={this.props.min} disabled={disabled}
    />);
  }

  bool({ value, disabled, hidden }) {
    return (
      <input
        type="checkbox"
        onChange={e => this.props.onChange(e.target.checked)}
        checked={value}
        disabled={disabled}
        hidden={hidden}
      />
    );
  }

  date({ onChange, value, readOnly, dateOnly, clearable = false, error }) {
    return (<DatePicker
      onChange={onChange}
      value={value}
      readOnly={readOnly}
      dateOnly={dateOnly}
      clearable={clearable}
      error={error}
    />);
  }

  div({ value }) {
    return <div className="form-control-static">{value}</div>;
  }

  select(props) {
    return <Select {...props} />;
  }

  error(props) {
    return <div className="error">{props.value}</div>;
  }

  render() {
    const { title, description, required, size, value, error, fileTypes = '',
      type = 'text', wrappedClass = 'form-group sahalin-field',
      children, style } = this.props;

    return (
      <div className={wrappedClass} style={style}>

        <label className="col-sm-3 control-label">
          {title}
          {required && <span className="aui-icon icon-required pull-left" />}
        </label>
        <div className="col-sm-9">{children || this[type](this.props)}</div>

        { description ? <div className="description">{description}</div> : null }
        { error ? <div className={styles.error}>{error}</div> : null }
      </div>
    );
  }
}
