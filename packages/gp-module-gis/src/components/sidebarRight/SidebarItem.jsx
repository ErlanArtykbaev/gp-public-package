import React, { PropTypes } from 'react';
import cx from 'classnames';
import makeFileUrl from '@gostgroup/gp-nsi-utils/lib/makeFileUrl';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';

function SidebarItem({ active, onClick, item, minimal, isLoading }) {
  const className = cx('dashboard-sidebar-right-item', { 'dashboard-sidebar-right-item-active': active, 'dashboard-sidebar-right-item-disabled': isLoading });
  const imgClassName = cx('dashboard-sidebar-right-item-icon', { 'dashboard-sidebar-right-item-icon-minimal': minimal });
  const showImagePreloader = !minimal && isLoading;
  const showCenteredPreloader = minimal && isLoading;
  return (
    <div className={className} title={item.title} onClick={() => onClick(item)}>
      {showCenteredPreloader && <Preloader width="29px" />}
      <div className={imgClassName}>
        {!showImagePreloader && !showCenteredPreloader && <img role="presentation" src={makeFileUrl(item.icon || {})} />}
        {showImagePreloader && <Preloader width="27px" />}
      </div>
      {!minimal && <div className="dashboard-sidebar-right-item-title">
        {item.title || item.name}
      </div>}
      {/* {!minimal && <input className="checkbox" item="checkbox" checked={active} readOnly />} */}
    </div>
  );
}

SidebarItem.propTypes = {
  item: PropTypes.object,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  minimal: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SidebarItem;
// connect(
//   // (state, { item }) => ({
//   //   isLoading: itemIsLoading(state)(item.id),
//   // }),
//   // { updateType: updateGeoObjectType }
// )(SidebarItem);
