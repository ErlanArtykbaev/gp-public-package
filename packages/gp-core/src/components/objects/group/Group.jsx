import React, { PropTypes } from 'react';
import Breadcrumbs from '../common/Breadcrumbs';
import ChildrenTable from './ChildrenTable';
import Toolbar from './Toolbar';
import ItemData from '../ItemData';
import configurableDetails from '../common/configurableDetails';


function Group(props) {
  const { item, path, disabled, itemDataIsVisible } = props;
  return (
    <div className="group">
      <Breadcrumbs path={path} />
      <h1>{item.fullTitle}</h1>
      <Toolbar disabled={disabled} item={item} splat={item.absolutPath} path={path} />
      {itemDataIsVisible && <ItemData item={item} />}
      <ChildrenTable {...props} />
    </div>
  );
}

Group.propTypes = {
  item: PropTypes.shape({}),
  path: PropTypes.arrayOf(PropTypes.shape({})),
  disabled: PropTypes.bool,
  itemDataIsVisible: PropTypes.bool,
};

// TODO реализовать работу с переходом по группам через redux
export default configurableDetails('toggle')(Group);
