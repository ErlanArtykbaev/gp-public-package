import * as React from 'react';
import { createValidDate } from '@gostgroup/gp-utils/dates';
import * as DatepickerComponent from 'react-datetime';
import 'moment/locale/ru';
import * as moment from 'moment';
import './datepicker.global.scss';
const ReactDatePicker: any = DatepickerComponent;

interface IProps {
  onChange: any;
  onError?: any;
  date?: string;
  className?: string;
  readOnly?: boolean;
  inputPlaceholder?: string;
  dateFormat?:string;
  showTime?:boolean;
  handleChange?: void;
}
interface IState {
  isValid?: boolean;
  invalidValue?: string;
}

const CONSTRAINTS = {
  hours: {
    min: 0,
    max: 23,
    step: 1,
  },
};

export default class DatePicker extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      isValid: true,
      invalidValue: null,
    };
  }
  public static defaultProps: Partial<IProps> = {
    dateFormat: 'дд.мм.гггг чч:мм:cc'
  };
  public handleChange(value: any) : void {
    const { dateFormat } = this.props;
    if (typeof value === 'string' && value.length === 0) {
      this.props.onChange(null);
      this.setState({
        isValid: true,
        invalidValue: null,
      });
      if (this.props.onError) {
        this.props.onError(null);
      }
      return;
    }
    const isValid = moment(value, dateFormat, true).isValid();
    if (isValid) {
      const formattedValue = createValidDate(value);
      this.props.onChange(formattedValue);
    } else if (!isValid && this.props.onError) {
      this.props.onError(null);
    }
    this.setState({
      isValid,
      invalidValue: isValid ? null : value
    });
  }
  render() {
    const {
      className,
      dateFormat,
      showTime,
      readOnly,
      date
    } = this.props;
    const { isValid, invalidValue } = this.state;
    let momentValue = null;
    if (isValid) {
      momentValue = date ? moment(date, dateFormat) : null;
    } else {
      momentValue = invalidValue;
    }
    const inputProps = {
      placeholder: dateFormat,
      required: false,
      disabled: readOnly,
    };

    const timeFormat = showTime ? 'HH:mm:ss' : false;
    const errorMessage = `Дата должна быть в формате ${dateFormat}`;
    return (
      <div>
        <ReactDatePicker
          dateFormat={dateFormat}
          timeFormat={timeFormat}
          value={momentValue}
          locale={'ru'}
          onChange={this.handleChange}
          className={className}
          timeConstraints={CONSTRAINTS}
          readOnly={readOnly}
          inputProps={inputProps}
        />
        <div className="error">{!isValid ? errorMessage : ''}</div>
      </div>
    );
  }

};







