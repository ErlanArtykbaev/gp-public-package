import React from 'react';
import { connect } from 'react-redux';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import ItemNode from './ItemNode';

// Список избранных справочников/групп

const FavouritesList = (props) => {
  const items = Object.keys(props.favourites)
    .map(key => props.favourites[key])
    .filter(item => !!item)
    .map((item, i) => <ItemNode key={i} item={item} level={1} />);

  return (
    <Div hidden={items.length === 0}>
      <div className="aui-nav-heading">
        <strong>Избранное</strong>
      </div>
      {items}
    </Div>
  );
};

FavouritesList.propTypes = {
  favourites: React.PropTypes.shape({}).isRequired,
};

export default connect(state => state.core.objects)(FavouritesList);
