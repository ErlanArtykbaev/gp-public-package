import React from 'react';
import Item from './TypeListItem';
import { DeletableList, MovableList } from '../../decorators';
import Panel from '../ui/panel';

@MovableList('types')
@DeletableList('types')
export default class GlobalTypeList extends React.Component {

  constructor() {
    super();
  }

  static propTypes = {
    types: React.PropTypes.object.isRequired,
    onAdd: React.PropTypes.func.isRequired,
    onDuplicate: React.PropTypes.func.isRequired,
    onSelect: React.PropTypes.func,
    selectedTypeId: React.PropTypes.string,
  }

  render() {
    return (
      <Panel title="Глобальные типы данных" tools={this.renderTools()}>
        {this.renderList(this.props)}
      </Panel>
    );
  }

  renderTools() {
    return (
      <a href="#" title="Добавить тип" onClick={(e) => { e.preventDefault(); this.props.onAdd(); }}>
        <i className="fa fa-plus-circle" />
      </a>
    );
  }

  renderItem(item, index) {
    return (
      <Item
        key={item.get('uuid')}
        title={item.getIn(['title', 'value'])}
        item={item}
        onDelete={this.onDelete.bind(this, index)}
        onMoveUp={this.onMoveUp.bind(this, index)}
        onMoveDown={this.onMoveDown.bind(this, index)}
        onSelect={this.props.onSelect.bind(null, item)}
        isSelected={item.get('uuid') === this.props.selectedTypeId}
        onDuplicate={this.props.onDuplicate.bind(null, item)}
        isGlobal
      />
    );
  }

  renderList({ types }) {
    const items = types.map(this.renderItem.bind(this));

    return (
      <div>
        <div className="list-group">
          {items.toArray()}
        </div>
        <div>
          <a onClick={this.props.onGlobalTypeSave} className="aui-button aui-button-default">Сохранить глобальный тип</a>
        </div>
      </div>
    );
  }

}
