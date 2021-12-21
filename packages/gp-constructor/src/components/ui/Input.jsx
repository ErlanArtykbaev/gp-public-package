import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import NumberInputComponent from '@gostgroup/gp-ui-components/lib/input/NumberInput';

export default class Input extends React.Component {

  static propTypes = {
    type: PropTypes.string,
    disabled: PropTypes.bool,
    hidden: PropTypes.bool,
    styles: PropTypes.shape({}),
    onChange: PropTypes.func,
    label: PropTypes.string,
    value: PropTypes.any,
    integer: PropTypes.bool,
  }

  static defaultProps = {
    type: 'text',
    disabled: false,
  }

  @autobind
  onChange(e) {
    const value = e.target.value;
    this.props.onChange(value);
  }

  @autobind
  onBoolChange(e) {
    const value = e.target.checked;
    this.props.onChange(value);
  }

  text() {
    const props = this.props;
    let className = 'form-group';

    if (props.error) {
      className += ' has-error';
    }

    if (!this.props.hidden) {
      return (
        <div className={className}>
          <label className="control-label" hidden={this.props.hidden}>{props.label}</label>
          <input
            type="text"
            className="form-control"
            value={props.value}
            onChange={this.onChange}
            disabled={this.props.disabled}
            hidden={this.props.hidden}
          />

          <span className="help-block">{props.error}</span>
        </div>
      );
    }
    return false;
  }

  number() {
    const props = this.props;
    let className = 'form-group';

    if (props.error) {
      className += ' has-error';
    }

    if (!this.props.hidden) {
      return (
        <div className={className}>
          <label className="control-label" hidden={this.props.hidden}>{props.label}</label>
          <NumberInputComponent
            integer={this.props.integer}
            className="form-control"
            value={props.value}
            onChange={this.props.onChange}
            disabled={this.props.disabled}
          />
          <span className="help-block">{props.error}</span>
        </div>
      );
    }
    return false;
  }

  bool() {
    const styles = this.props.styles || {};
    return (
      <div className="checkbox" style={styles} >
        <label>
          <input
            type="checkbox"
            checked={this.props.value}
            onChange={this.onBoolChange}
            disabled={this.props.disabled}
            hidden={this.props.hidden}
          />
          {this.props.hidden ? '' : this.props.label}
        </label>
      </div>
    );
  }

  render() {
    return this[this.props.type]();
  }

}
