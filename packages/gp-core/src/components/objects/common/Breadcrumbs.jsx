import { Link } from 'react-router';
import React from 'react';
import last from 'lodash/last';
import getRouteNameByType from '@gostgroup/gp-utils/lib/getRouteNameByType';
import FavouriteButton from './FavouriteButton';

// TODO refactor aui
const Breadcrumbs = (props) => {
  const { path } = props;
  const tail = last(path);
  return (
    <ol className="aui-nav aui-nav-breadcrumbs">
      {path.slice(0, -1).map(({ type, absolutPath, shortTitle }) => (
        <li key={absolutPath}>
          <Link to={`/${getRouteNameByType(type)}s/${absolutPath}`}>{shortTitle}</Link>
        </li>
      ))}
      {tail && (
        <li className="aui-nav-selected">
          {tail.shortTitle}
          {tail.type !== 'group' && <FavouriteButton item={tail} />}
        </li>
      )}
    </ol>
  );
};

Breadcrumbs.propTypes = {
  path: React.PropTypes.array,
};

export default Breadcrumbs;
