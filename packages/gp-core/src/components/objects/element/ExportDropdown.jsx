import React, { PropTypes } from 'react';
import get from 'lodash/get';

import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import { exportElement, exportElementByTemplate } from '@gostgroup/gp-api-services/lib/helpers/element/exportElement';
import convertPropertyFilters from '@gostgroup/gp-nsi-utils/lib/element/convertPropertyFilters';

export default class ExportDropdown extends React.Component {

  static propTypes = {
    element: PropTypes.shape({
      element: PropTypes.shape({
        absolutPath: PropTypes.string,
        schema: PropTypes.shape({}),
      }),
      date: PropTypes.string,
    }),
    parentColumn: PropTypes.string,
    pageSetting: PropTypes.shape({
      propertyFilters: PropTypes.arrayOf(PropTypes.shape({})),
      columns: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    showDeleted: PropTypes.bool,
    order: PropTypes.shape({}),
  }

  getExportParams = (props = this.props) => {
    const { parentColumn, element, pageSetting, order, showDeleted } = props;
    const { propertyFilters, columns } = pageSetting;
    const exportParams = {
      date: element.date,
      filter: convertPropertyFilters(propertyFilters),
      order,
      showDeleted,
      columns: columns.filter(col => !col.isHidden).map(col => col.columnName).join(','),
    };
    if (parentColumn && parentColumn.length > 0) {
      exportParams.parentColumn = parentColumn;
    }
    return exportParams;
  }

  exportXLS(e) {
    const { element } = this.props;
    const exportParams = this.getExportParams();
    exportElement(element.element, 'items-xls', exportParams);
    e.preventDefault();
    e.stopPropagation();
  }

  export = type => () => {
    const { element } = this.props;
    const exportParams = {
      date: element.date,
    };
    exportElement(element.element, type, exportParams);
  }

  exportTemplate = templateId => () => {
    const { element } = this.props;
    const exportParams = this.getExportParams();
    exportElementByTemplate(element.element, templateId, exportParams);
  }

  render() {
    const exportTemplates = get(this.props.element.element.schema, 'exportTemplates');
    return (
      <DropdownButton id="export-dropdown" pullRight title={'??????????????'} className="sh-btn btn">
        <MenuItem onClick={e => this.exportXLS(e)}>?????????????? ???????????? XLS</MenuItem>
        <MenuItem onClick={this.export('items-pdf')}>?????????????? ???????????? PDF</MenuItem>
        <MenuItem onClick={this.export('items-html')}>?????????????? ???????????? HTML</MenuItem>
        <MenuItem onClick={this.export('items-csv')}>?????????????? ???????????? CSV</MenuItem>
        <MenuItem onClick={this.export('items-xml')}>?????????????? ???????????? XML (???? ????????)</MenuItem>
        <MenuItem onClick={this.export('items-xml-all-versions')}>?????????????? ???????????? XML (?????? ????????????)</MenuItem>
        <MenuItem onClick={this.export('items-xsd')}>?????????????? ?????????? ???????????? XSD</MenuItem>
        <MenuItem onClick={this.export('items-json')}>?????????????? ???????????? JSON</MenuItem>
        <MenuItem onClick={this.export('items-json-scheme')}>?????????????? ?????????? ???????????? JSON</MenuItem>
        { exportTemplates &&
          <li className="export-templates">
            <DropdownButton id="export-templates" pullRight title={'?????????????? ???? ??????????????'} className="export-template-btn" >
              {
                exportTemplates.map(item => (
                  <MenuItem key={item.uuid} onClick={this.exportTemplate(item.uuid)}>{item.title.value}</MenuItem>
                                  )
                              )
              }
            </DropdownButton>
          </li>
        }
      </DropdownButton>
    );
  }
}
