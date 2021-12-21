import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { SortableContainer, arrayMove } from 'react-sortable-hoc';
import Immutable from 'immutable';
import BaseExportList from './ExportList';
import { createNewType, cloneType } from '../../models/export.js';

const ExportList = SortableContainer(props => <BaseExportList {...props} />); // eslint-disable-line new-cap

@autobind
export default class ExportListController extends React.Component {

  static propTypes = {
    cursor: PropTypes.func.isRequired,
    main_data: PropTypes.shape({}).isRequired,
    onSelected: PropTypes.func.isRequired,
    selected: PropTypes.string,
  }

  componentDidMount() {
    // если тип не выбран, то выбирается первый тип
    const cursor = this.props.cursor();
    if (!cursor.get('selected')) {
      // this.onSelect(this.props.cursor(['exportTemplates', 0]));
    }
  }

  onAdd() {
    const exportTemplates = this.props.cursor(['exportTemplates']);// cursor.get('exportTemplates').deref();
    const exportTemplatesList = this.props.cursor(['exportTemplates']).toJS() || [];
    const exportTemplate = createNewType(exportTemplates);
    exportTemplatesList.push(exportTemplate);
    const cursor = this.props.cursor();
    cursor.update(templates => templates.push(exportTemplate));
    this.props.onSelected(exportTemplate.get('uuid'));
  }

  onSelect(t) {
    this.props.onSelected(t.get('uuid'));
  }

  onChange(templates) {
    this.props.cursor().update(() => templates);
  }

  render() {
    return (
      <ExportList
        exportTemplates={this.props.cursor(['exportTemplates']).deref()}
        selectedTypeId={this.props.selected}
        onAdd={this.onAdd}
        onChange={this.onChange}
        onSelect={this.onSelect}
        onDuplicate={this.onDuplicate}
        main_data={this.props.main_data}
        // hideSortableGhost={false}
        pressDelay={100}
        onSortEnd={this.onSortEnd}
      />
    );
  }

}
