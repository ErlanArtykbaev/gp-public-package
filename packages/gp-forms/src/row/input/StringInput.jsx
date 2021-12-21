import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';
import get from 'lodash/get';

import BaseAutoSuggest from '@gostgroup/gp-ui-components/lib/AutoSuggest';

function mapDaDataSuggestions(suggestion) {
  return {
    value: suggestion.value,
    label: suggestion.value,
    unrestricted_value: suggestion.unrestricted_value,
  };
}

const AutoSuggest = props => <BaseAutoSuggest suggestionsMapper={mapDaDataSuggestions} {...props} />;

const modifications = {
  capitalize: v => v.charAt(0).toUpperCase() + v.slice(1),
  floatize: v => v.replace(',', '.'),
};


export default class StringInput extends React.Component {

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
    onAutoSuggestChange: React.PropTypes.func,
    autosuggest: React.PropTypes.bool,
  }

  static defaultProps = {
    data: '',
    readonly: false,
  }

  @autobind
  handleChange(e) {
    if (this.props.onDataChange) {
      const { config } = this.props;
      const stringValue = e.target.value;
      const typeConfig = get(config, 'config') || {};
      const isNumber = config.type === 'number';
      const value = isNumber ? stringValue.replace(',', '.') : stringValue;
      this.props.onDataChange(typeConfig.capitalize ? modifications.capitalize(value) : value);
    }
  }

  render() {
    const { data, error, readonly, config, style, onAutoSuggestChange, autosuggest = false } = this.props;
    const typeConfig = get(config, 'config') || {};
    const isText = typeConfig.isText;
    const formIsReadOnly = this.props.readOnly || readonly;


    const inputClasses = cx('text', 'input--text', {
      'input--invalid': error,
    });

    const props = {
      style,
      className: cx(inputClasses, { 'input--readonly': formIsReadOnly }),
      value: !isEmpty(data) ? data : '',
      onChange: this.handleChange,
      disabled: formIsReadOnly,
    };

    if (autosuggest && typeof onAutoSuggestChange === 'function') {
      return (
        <AutoSuggest
          {...props}
          {...this.props}
        />
      );
    }
    return isText ? <textarea {...props} /> : <input {...props} />;
  }
}
