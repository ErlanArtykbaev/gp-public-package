import React, { PropTypes } from 'react';
import cx from 'classnames';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';
import NumberInputComponent from '@gostgroup/gp-ui-components/lib/input/NumberInput';

export default class NumberInput extends React.Component {

  static propTypes = {
    data: PropTypes.any,
    onDataChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    readonly: PropTypes.bool,
    config: PropTypes.shape({
      config: PropTypes.shape({
        isRegexpRequired: PropTypes.bool,
        isText: PropTypes.bool,
      }),
    }),
    readOnly: React.PropTypes.bool,
    style: React.PropTypes.shape({}),
  }

  static defaultProps = {
    data: '',
    readonly: false,
  }

  render() {
    const { data, error, readonly, config, style } = this.props;
    const formIsReadOnly = this.props.readOnly || readonly;

    const inputClasses = cx('text', 'input--text', {
      'input--invalid': error,
    });

    const props = {
      style,
      className: cx(inputClasses, { 'input--readonly': formIsReadOnly }),
      value: !isEmpty(data) ? data : '',
      onChange: this.props.onDataChange,
      disabled: formIsReadOnly,
    };

    if (config.type === 'integer') {
      props.maxLength = 17;
      props.pattern = 'd*';
      props.integer = true;
    }

    return <NumberInputComponent {...props} />;
  }
}
