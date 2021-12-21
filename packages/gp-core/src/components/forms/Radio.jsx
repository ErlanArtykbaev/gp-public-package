import React, { PropTypes } from 'react';

const Radio = (props) => {
  const { description, value, error, className } = props;
  return (
    <div className={className}>
      <label>
        <input
          type="radio"
          name={props.name}
          value={value}
          checked={props.checked}
          disabled={props.disabled}
          onChange={() => props.onChange(value)}
        />
        {props.required && <span className="aui-icon icon-required" /> }
        {props.title}
      </label>
      { description && <div className="description">{description}</div> }
      { error && <div className="error">{error}</div> }
    </div>
  );
};

Radio.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
  error: PropTypes.string,
  checked: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

Radio.defaultProps = {
  className: 'radio',
};

export default Radio;
