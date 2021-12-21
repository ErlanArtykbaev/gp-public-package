import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import ContextMenuContainer from '../schema/ContextMenuContainer';

function noop() {}

@autobind
export default class ExportListItem extends React.Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    item: PropTypes.shape({
      get: PropTypes.func,
    }),
    isSelected: PropTypes.bool,
    onSelect: PropTypes.func,
    onDuplicate: PropTypes.func,
    onDelete: PropTypes.func,
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
  }

  getActions() {
    const actions = [];

    actions.push({
      key: 'remove',
      title: 'Удалить',
      handler: this.props.onDelete,
      icon: <i className="fa fa-times" />,
    });

    return actions;
  }

  handleClick() {
    this.props.onSelect();
  }

  render() {
    const { isSelected } = this.props;
    const { title } = this.props;

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
