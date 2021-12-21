import React, { PropTypes } from 'react';
import omit from 'lodash/omit';
import get from 'lodash/get';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';

function integerFormatter(stringOrInt) {
  const parsedToInt = parseInt(stringOrInt, 10);
  if (isNaN(parsedToInt)) {
    return null;
  }
  return parsedToInt;
}

function floatFormatter(stringOrFloat) {
  const parsedToFloat = parseFloat(stringOrFloat);
  if (isNaN(parsedToFloat)) {
    return null;
  }
  return parsedToFloat;
}

const floatRegexp = /^[-]?[0-9]*\.?[0-9]*$/;
const extractFloat = (string) => {
  const extraction = floatRegexp[Symbol.match](string);
  return get(extraction, 0, null);
};
const integerRegexp = /^[-]?[0-9]*$/;
const extractInteger = (string) => {
  const extraction = integerRegexp[Symbol.match](string);
  return get(extraction, 0, null);
};

export default class NumberInput extends React.Component {

  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    integer: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    const { value } = props;

    this.state = {
      value: isEmpty(value) ? '' : value,
    };
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (value !== this.state.value) this.setState({ value: isEmpty(value) ? '' : value });
  }

  handleChange = (e) => {
    if (this.props.onChange) {
      const typeIsInteger = !!this.props.integer;
      const stringValue = e.target.value;
      if (typeIsInteger) {
        const extractedInteger = extractInteger(stringValue);
        if (extractedInteger === null) return;
        this.setState({ value: extractedInteger });
        this.props.onChange(integerFormatter(extractedInteger));
        return;
      }
      const extractedFloat = extractFloat(stringValue);
      if (extractedFloat === null) return;
      this.setState({ value: extractedFloat });
      this.props.onChange(floatFormatter(extractedFloat));
    }
  }

  render() {
    return (
      <input
        type="text"
        {...omit(this.props, ['integer'])}
        value={this.state.value} onChange={this.handleChange}
      />
    );
  }
}
