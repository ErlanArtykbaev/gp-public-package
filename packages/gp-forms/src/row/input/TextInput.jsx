import React from 'react';
import cx from 'classnames';

export default class TextInput extends React.Component {

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    if (this.props.onDataChange) {
      this.props.onDataChange(evt.target.value);
    }
  }

  render() {
    const { config, data, error, readOnly } = this.props;

    const inputClasses = cx('textarea', 'input--textarea', {
      'input--invalid': error,
    });

    if (readOnly) {
      return <div className={inputClasses}>{data}</div>;
    }
    return <textarea id={config.id} rows={4} className={inputClasses} value={data} onChange={this.handleChange} />;
  }
}

TextInput.propTypes = {
  data: React.PropTypes.any,
  onDataChange: React.PropTypes.func.isRequired,
  config: React.PropTypes.object.isRequired,
  error: React.PropTypes.string,
  readOnly: React.PropTypes.bool,
};
