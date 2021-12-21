import React from 'react';
import omit from 'lodash/omit';

const styleKeys = ['primary', 'link', 'default'];
const base = 'btn btn-default sh-btn';

const AuiButton = (p) => {
  const className = [base, styleKeys.map(k => p[k] ? `${base}-${k}` : '')].join(' ');
  return <button type="button" className={className} {...omit(p, styleKeys)}>{p.children}</button>;
};

export default AuiButton;
