import React from 'react';
import cx from 'classnames';
import { DIFF_COLORS } from 'gp-core/lib/components/diff';
import togglable from '@gostgroup/gp-hocs/lib/togglable';
import ButtonLink from '@gostgroup/gp-ui-components/lib/ButtonLink';


const Panel = (props) => {
  const { title, change, children, isCollapsed, toggleCollapsed } = props;
  const backgroundColor = change ? DIFF_COLORS.BG[change] : undefined;
  const collapsedIconClass = cx('fa', { 'fa-angle-right': isCollapsed, 'fa-angle-down': !isCollapsed });

  return (
    <div className="panel panel-default">
      <div className="panel-heading" style={{ backgroundColor, cursor: 'pointer' }} onClick={toggleCollapsed}>
        <ButtonLink title={isCollapsed ? 'Развернуть' : 'Свернуть'}>
          <i className={collapsedIconClass}>&nbsp;</i>
        </ButtonLink>
        <span className="name-property">
          {title}
        </span>
      </div>
      {!isCollapsed &&
        <div className="panel-body">{children}</div>
      }
    </div>
  );
};

Panel.propTypes = {
  title: React.PropTypes.any.isRequired,
  children: React.PropTypes.any,
  change: React.PropTypes.string,
  isCollapsed: React.PropTypes.bool,
  toggleCollapsed: React.PropTypes.func,
};

export default togglable('isCollapsed', 'toggleCollapsed', true)(Panel);
