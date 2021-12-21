import React, { Component } from 'react';
import Griddle from 'griddle-react';
import Paginator from './Paginator';

export const columnMeta = (columnName, displayName, customComponent, options) => ({
  columnName,
  displayName,
  customComponent,
  ...options,
});

export default class SimpleGriddle extends Component {

  render() {
    const CONSTANT_PROPS = {
      useGriddleStyles: this.props.useGriddleStyles || false,
      useCustomPagerComponent: this.props.useCustomPagerComponent || true,
      customPagerComponent: this.props.customPagerComponent || Paginator,
      resultsPerPage: this.props.resultsPerPage || 15,
      noDataMessage: this.props.noDataMessage || 'Нет данных',
      tableClassName: this.props.tableClassName || 'tablesorter',
    };

    return (
      <Griddle {...CONSTANT_PROPS} {...this.props} />
    );
  }
}
