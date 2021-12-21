import React from 'react';
import cx from 'classnames';

class TextInput extends React.Component {

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
    const { data, error, readOnly } = this.props;

    const inputClasses = cx('input', 'input--text', {
      'input--invalid': error,
    });

    if (readOnly) {
      return <div className={inputClasses}>{data}</div>;
    } else {
      return <input type="text" className={inputClasses} value={data} onChange={this.handleChange} />;
    }
  }

}

TextInput.propTypes = {
  data: React.PropTypes.any,
  onDataChange: React.PropTypes.func.isRequired,
  config: React.PropTypes.object.isRequired,
  error: React.PropTypes.string,
};

export default TextInput;
