import React, { PropTypes } from 'react';
import cx from 'classnames';

const Select = (props) => {
  const { error, value, label, options, disabled, onChange } = props;
  return (
    <div className={cx('form-group', { 'has-error': error })}>
      <label className="control-label">{label}</label>
      <select
        className="form-control"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map(o => (
          <option key={o.get('id')} value={o.get('id')} disabled={o.get('disabled')} >
            {o.get('title')}
          </option>
        )).toJS()}
      </select>

      {error && <span className="help-block">{error}</span>}
    </div>
  );
};

Select.propTypes = {
  error: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.shape({}),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

export default Select;
