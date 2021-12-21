import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';
import { addToFavourites, removeFromFavourites } from 'gp-core/lib/redux/modules/objects';
import { isObjectFavourite } from 'gp-core/lib/redux/selectors/objects';

@connect(
  (state, { item }) => ({
    isFavourite: isObjectFavourite(state)(item.absolutPath),
  }),
  { addToFavourites, removeFromFavourites },
)
@autobind
export default class FavouriteButton extends React.Component {

  static propTypes = {
    item: PropTypes.shape({
      absolutPath: PropTypes.string.isRequired,
    }),
    addToFavourites: PropTypes.func,
    removeFromFavourites: PropTypes.func,
    isFavourite: PropTypes.bool,
  }

  onFavouriteClick() {
    this.props.addToFavourites(this.props.item);
  }

  onUnfavouriteClick() {
    this.props.removeFromFavourites(this.props.item);
  }

  render() {
    const { isFavourite } = this.props;

    if (isFavourite) {
      return (
        <i
          title="Удалить из избранного"
          className="fa fa-star gost-favourite-icon gost-favourite-icon-full"
          onClick={this.onUnfavouriteClick}
        />
      );
    }
    return (
      <i
        title="Добавить в избранное"
        className="fa fa-star-o gost-favourite-icon gost-favourite-icon-empty"
        onClick={this.onFavouriteClick}
      />
    );
  }

}
