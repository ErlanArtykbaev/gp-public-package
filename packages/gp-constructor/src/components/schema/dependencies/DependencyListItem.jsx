import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import ContextMenuContainer from '../ContextMenuContainer';

function noop() {}

@autobind
export default class DependencyListItem extends React.Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    item: PropTypes.shape({
      get: PropTypes.func,
    }),
    isSelected: PropTypes.bool,
    isMain: PropTypes.bool,
    isGlobal: PropTypes.bool,
    onSelect: PropTypes.func,
    onDuplicate: PropTypes.func,
    onDelete: PropTypes.func,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    onMakeMain: PropTypes.func,
    main_data: PropTypes.shape({
      shortTitle: PropTypes.string,
    }),
  }

  static contextTypes = {
    container: React.PropTypes.object.isRequired,
  }

  static defaultProps = {
    title: '',
    isSelected: false,
    onSelect: noop,
    onDuplicate: noop,
    // deletable
    onDelete: noop,
    // movable
    canMoveUp: true,
    canMoveDown: true,
    onMoveUp: noop,
    onMoveDown: noop,
  }

  getActions() {
    const actions = [];
    const { isMainImmutable } = this.context.container;

    actions.push({
      key: 'remove',
      title: 'Удалить',
      handler: this.props.onDelete,
      icon: <i className="fa fa-times" />,
    });

    actions.push({
      key: 'up',
      title: 'Перенести выше',
      handler: this.props.onMoveUp,
      icon: <i className="fa fa-arrow-up" />,
    });

    actions.push({
      key: 'down',
      title: 'Перенести ниже',
      handler: this.props.onMoveDown,
      icon: <i className="fa fa-arrow-down" />,
    });

    actions.push({
      key: 'duplicate',
      title: 'Дублировать',
      handler: this.props.onDuplicate,
      icon: <i className="fa fa-files-o" />,
    });

    if (!this.props.isMain && !isMainImmutable && this.props.isGlobal !== true) {
      actions.push({
        key: 'main',
        title: 'Сделать главным',
        handler: this.props.onMakeMain,
        icon: <i className="fa fa-star" />,
      });
    }

    return actions;
  }

  handleClick() {
    this.props.onSelect();
  }

  render() {
    const { isSelected } = this.props;
    let { title } = this.props;

    if (this.props.main_data && this.props.isMain) {
      if (this.props.main_data.shortTitle) {
        title = this.props.main_data.shortTitle;
      }
    }

    const className = cx('type-list-item list-group-item', { active: isSelected });

    return (
      <ContextMenuContainer
        className={className}
        onClick={this.handleClick}
        actions={this.getActions()}
      >
        <div className="type-list-item-text">
          {title}
        </div>
      </ContextMenuContainer>
    );
  }

}
