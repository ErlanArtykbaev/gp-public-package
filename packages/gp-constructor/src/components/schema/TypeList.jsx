import React, { PropTypes } from 'react';
import { SortableElement } from 'react-sortable-hoc';
import Item from './TypeListItem';
import { DeletableList, MovableList } from '../../decorators';
import Panel from '../ui/panel';

const SortableItem = SortableElement(Item); // eslint-disable-line new-cap

@MovableList('types') // eslint-disable-line new-cap
@DeletableList('types') // eslint-disable-line new-cap
export default class TypeList extends React.Component {

  static propTypes = {
    types: PropTypes.object.isRequired,
    onAdd: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onSelect: PropTypes.func,
    onMakeMain: PropTypes.func,
    selectedTypeId: PropTypes.string,
    main_data: PropTypes.shape({}).isRequired,
  }

  renderTools() {
    return (
      <a title="Добавить тип" onClick={(e) => { e.preventDefault(); this.props.onAdd(); }}>
        <i className="fa fa-plus-circle" />
      </a>
    );
  }

  renderItem(item, index) {
    return (
      <SortableItem
        key={item.get('uuid')}
        main_data={this.props.main_data}
        title={item.getIn(['title', 'value'])}
        item={item}
        index={index}
        onDelete={this.onDelete.bind(this, index)}
        onMoveUp={this.onMoveUp.bind(this, index)}
        onMoveDown={this.onMoveDown.bind(this, index)}
        onSelect={() => this.props.onSelect(item)}
        onMakeMain={() => this.props.onMakeMain(item)}
        onDuplicate={() => this.props.onDuplicate(item)}
        isSelected={item.get('uuid') === this.props.selectedTypeId}
        isMain={item.get('main')}
      />
    );
  }

  renderList(types) {
    return (
      <div className="list-group">
        {types.map(this.renderItem.bind(this))}
      </div>
    );
  }

  render() {
    return (
      <Panel title="Локальные типы данных" tools={this.renderTools()}>
        {this.renderList(this.props.types)}
      </Panel>
    );
  }

}
