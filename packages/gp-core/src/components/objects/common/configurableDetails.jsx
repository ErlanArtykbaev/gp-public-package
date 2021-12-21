import React, { PropTypes } from 'react';
import togglable from '@gostgroup/gp-hocs/lib/togglable';

export const detailPropTypes = {
  itemDataIsVisible: PropTypes.bool,
  toggleItemData: PropTypes.func.isRequired,
  itemDataMode: PropTypes.string,
};


export const DetailsToggle = (p) => {
  if (p.itemDataMode !== 'toggle') return null;
  return (<button
    type="button"
    className={p.className || 'sh-btn btn'}
    onClick={p.toggleItemData}
    style={p.style}
  >
    {p.itemDataIsVisible ? 'Скрыть' : 'Отобразить'} служебную информацию
  </button>);
};

DetailsToggle.propTypes = { ...detailPropTypes, className: PropTypes.string };


export default (itemDataMode = 'show') => (Cmp) => {
  const WithToggle = togglable('itemDataIsVisible', 'toggleItemData', false)(Cmp);

  const Wrapped = p => (<WithToggle
    {...p}
    itemDataIsVisible={p.itemDataMode === 'show' || (p.itemDataMode === 'toggle' && p.itemDataIsVisible)}
  />);
  Wrapped.defaultProps = { itemDataMode };

  return Wrapped;
};
