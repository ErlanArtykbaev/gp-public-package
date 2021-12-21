import React, { PropTypes } from 'react';
import makeUUID from 'uuid';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import enhanceWithPermissions from '../hoc/RequirePermissions';
import styles from './dropdownMenu.scss';
import LinkWrapper from './LinkWrapper';

const DropdownMenu = enhanceWithPermissions((props) => {
  const { children = [], id = 'dropdown-menu', title } = props;
  const items = (children.length) ? children : props.items;

  return (
    <Dropdown id={id} pullRight>
      <Dropdown.Toggle noCaret className={styles.toggle}>
        {!!title && title}
        {!title && <div className="fa fa-bars" />}
      </Dropdown.Toggle>
      <Dropdown.Menu className={styles.menu}>
        {items.map((menuItem) => {
          const key = makeUUID();

          if (menuItem.href) {
            return (
              <LinkWrapper single permissions={menuItem.permissions} key={key} to={`/${menuItem.route}/`} href={menuItem.href} {...props}>{menuItem.title}</LinkWrapper>
            );
          }

          return (menuItem.children && menuItem.children.length) ? <DropdownMenu {...menuItem} /> : <LinkWrapper single permissions={menuItem.permissions} key={key} to={`/${menuItem.route}/`} {...props}>{menuItem.title}</LinkWrapper>;
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
});

DropdownMenu.defaultProps = {
  className: 'dropdown-menu-btn fa fa-bars',
};

DropdownMenu.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
};

export default DropdownMenu;
