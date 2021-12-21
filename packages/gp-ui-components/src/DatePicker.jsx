import React, { PropTypes } from 'react';
import cx from 'classnames';
import ReactDatePicker from 'react-datetime';
import moment from 'moment';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';
import 'moment/locale/ru';
import './datepicker.global.scss';

const CONSTRAINTS = {
  hours: {
    min: 0,
    max: 23,
    step: 1,
  },
};

export default class DatePicker extends React.Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func,
    value: PropTypes.string, // строка в виде global.APP_DATETIME_FORMAT
    label: PropTypes.string,
    className: PropTypes.string,
    readOnly: PropTypes.bool,
    specifyTime: PropTypes.bool,
  }

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      isValid: true,
    };
  }

  handleChange(value) {
    if (typeof value === 'string' && value.length === 0) {
      this.props.onChange(null);
      this.setState({ isValid: true, invalidValue: null });
      if (this.props.onError) {
        this.props.onError(null);
      }
      return;
    }
    const isValid = moment(value, global.APP_DATETIME_FORMAT, true).isValid();
    if (isValid) {
      const formattedValue = createValidDate(value);
      this.props.onChange(formattedValue);
    } else if (!isValid && this.props.onError) {
      this.props.onError(null);
    }
    this.setState({ isValid, invalidValue: isValid ? null : value });
  }

  render() {
    const { isValid, invalidValue } = this.state;
    const { value, readOnly, specifyTime } = this.props;
    let momentValue = null;
    if (isValid) {
      momentValue = value ? moment(value, global.APP_DATETIME_FORMAT) : null;
    } else {
      momentValue = invalidValue;
    }

    const inputProps = {
      placeholder: (specifyTime) ? global.APP_DATETIME_FORMAT_RUS : global.APP_DATE_FORMAT_RUS,
      required: false,
      disabled: readOnly,
    };

    const timeFormat = (specifyTime) ? 'HH:mm:ss' : false;
    const errorMessage = specifyTime
      ? `Дата должна быть в формате ${global.APP_DATETIME_FORMAT_RUS}`
      : `Дата должна быть в формате ${global.APP_DATE_FORMAT_RUS}`
    ;

    return (
      <div>
        <div>
          {this.props.label && <label htmlFor="datepicker">{this.props.label}</label>}
        </div>
        <ReactDatePicker
          dateFormat={global.APP_DATE_FORMAT}
          timeFormat={timeFormat}
          value={momentValue}
          locale={'ru'}
          onChange={this.handleChange}
          inputProps={inputProps}
          className={cx('datetimesecondspicker', { 'datetimesecondspicker-invalid': !isValid }, this.props.className ? this.props.className : false)}
          timeConstraints={CONSTRAINTS}
          readOnly={readOnly}
        />
        <div className="error">{!isValid ? errorMessage : ''}</div>
      </div>
    );
  }
}
