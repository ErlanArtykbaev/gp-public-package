import React, { PropTypes } from 'react';
import ExportListItem from './ExportListItem';
import { DeletableList } from '../../decorators';
import Panel from '../ui/panel';

@DeletableList('exportTemplates') // eslint-disable-line new-cap
export default class ExportList extends React.Component {

  static propTypes = {
    exportTemplates: PropTypes.object.isRequired,
    onAdd: PropTypes.func.isRequired,
    onSelect: PropTypes.func,
    selectedTypeId: PropTypes.string,
    main_data: PropTypes.shape({}).isRequired,
  }

  renderTools() {
    return (
      <a title="Добавить шаблон" onClick={(e) => { e.preventDefault(); this.props.onAdd(); }}>
        <i className="fa fa-plus-circle" />
      </a>
    );
  }

  renderItem(item, index) {
    return (
      <ExportListItem
        key={item.get('uuid')}
        main_data={this.props.main_data}
        title={item.getIn(['title', 'value'])}
        item={item}
        index={index}
        onDelete={this.onDelete.bind(this, index)}
        onSelect={() => this.props.onSelect(item)}
        onDuplicate={() => this.props.onDuplicate(item)}
        isSelected={item.get('uuid') === this.props.selectedTypeId}
      />
    );
  }

  renderList(exportTemplates) {
    return (
      <div className="list-group">
        {exportTemplates.map(this.renderItem.bind(this))}
      </div>
    );
  }

  render() {
    return (
      <Panel title="Настройки шаблонов экспорта" tools={this.renderTools()}>
        {this.renderList(this.props.exportTemplates)}
      </Panel>
    );
  }

}
