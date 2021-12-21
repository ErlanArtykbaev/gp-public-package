import React, { Component, PropTypes } from 'react';
import { formatDate } from '@gostgroup/gp-utils/lib/util.js';
import DatePicker from '@gostgroup/gp-ui-components/lib/DatePicker';
import get from 'lodash/get';
import cx from 'classnames';

export default class DateTime extends Component {

  static propTypes = {
    data: React.PropTypes.string,
    onDataChange: React.PropTypes.func.isRequired,
    error: React.PropTypes.string,
    readOnly: React.PropTypes.bool,
    dateOnly: React.PropTypes.bool,
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { config, data, error, readOnly, dateOnly } = this.props;
    const typeConfig = get(config, 'config') || {};
    const value = formatDate(data);
    const inputClasses = cx('text', 'aui-date-picker', {
      'input--invalid': error,
    });

    if (readOnly) {
      return <div className={inputClasses}>{value}</div>;
    }

    return (
      <DatePicker
        onChange={this.props.onDataChange}
        value={value}
        readOnly={readOnly}
        specifyTime={typeConfig.time}
        dateOnly={dateOnly}
        error={error}
      />
    );
  }
}
