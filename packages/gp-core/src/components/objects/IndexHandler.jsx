import React from 'react';
import cx from 'classnames';
import togglable from '@gostgroup/gp-hocs/lib/togglable';
import ObjectTree from './ObjectTree';
import FavouritesList from './FavouritesList';

const IndexHandler = (props) => {
  const { isCollapsed, toggleCollapsed } = props;
  return (
    <div>
      <div className={cx('aui-page-panel-nav', { 'aui-page-panel-nav--collapsed': isCollapsed })}>
        <div onClick={toggleCollapsed} className="nav-toggle-btn">
          <div className={cx('nav-toggle-btn--img', { 'nav-toggle-btn--img--collapsed': isCollapsed })} />
        </div>
        <div className="aui-page-panel-nav__scrollable">
          <nav className="aui-navgroup-inner wrap-aui-nav-content" style={{ opacity: isCollapsed ? 0 : 1, marginTop: 20 }}>
            <FavouritesList />
            <ObjectTree title="СПРАВОЧНИКИ" />
          </nav>
        </div>
      </div>

      <div className={cx('aui-page-panel-content', { 'aui-page-panel-content--wider': isCollapsed })}>
        <div className="aui-page-panel-content-wrap">
          {props.children}
        </div>
      </div>

    </div>
  );
};

IndexHandler.propTypes = {
  isCollapsed: React.PropTypes.bool,
  toggleCollapsed: React.PropTypes.func,
  children: React.PropTypes.node,
};

export default togglable('isCollapsed', 'toggleCollapsed', false)(IndexHandler);
