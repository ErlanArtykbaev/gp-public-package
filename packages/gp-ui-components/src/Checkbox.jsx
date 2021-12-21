import React from 'react';

export default ({ onChange, checked, label, style, className }) => (
  <div className={`${className} checkbox`} style={style}>
    <input
      type="checkbox"
      id="showNotAvailable"
      onChange={onChange}
      checked={checked}
    />
    <label htmlFor="showNotAvailable">
      {label}
    </label>
  </div>
);
