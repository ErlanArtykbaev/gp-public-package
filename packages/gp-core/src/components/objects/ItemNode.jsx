import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import cx from 'classnames';
import getRouteNameByType from '@gostgroup/gp-utils/lib/getRouteNameByType';
import FavouriteButton from './common/FavouriteButton';

const LEVEL_OFFSET = 10;

export default class ItemNode extends React.Component {

  static propTypes = {
    item: PropTypes.shape({}),
    level: PropTypes.number,
    onClick: PropTypes.func,
  }

  constructor(props, context) {
    super(props, context);
    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    const { item, onClick } = this.props;

    if (typeof onClick === 'function') {
      onClick(item, event);
    }
  }

  render() {
    const { item, level } = this.props;
    const { type, absolutPath, shortTitle } = item;
    const paddingLeft = LEVEL_OFFSET * level;
    const classes = cx({
      'gost-tree-node': true,
      'gost-tree-node-item': true,
      'gost-tree-node-item-highlighted': item.hasSelection,
    });

    return (
      <div style={{ paddingLeft }} className={classes}>
        <Link to={`/${getRouteNameByType(type)}s/${absolutPath}`} onClick={this.onClick}>{shortTitle}</Link>
        <FavouriteButton item={item} />
      </div>
    );
  }

}
