import React, { PropTypes, Component } from 'react';
import Griddle from 'griddle-react';
import Paginator from '@gostgroup/gp-ui-components/lib/Paginator';

import { connect } from 'react-redux';
import { elementHasDraftsSelector, elementNewDraftsSelector } from 'gp-core/lib/redux/selectors/recordDraft';

import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import union from 'lodash/union';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import cx from 'classnames';
import dictionary from 'gp-core/lib/constants/dictionary.js';
import StyledComponent from './cell';
import RecordTableSubmit from './RecordTableSubmit';
import RecordTableRemove from './RecordTableRemove';
import Row from './row';
import NestableHeader from './NestableHeader';
import { flattenSchema, evalResult } from './helpers';

@connect(
  (state, props) => ({
    hasStagedChanges: elementHasDraftsSelector(state)(props.absolutPath),
    creating: elementNewDraftsSelector(state)(props.absolutPath),
  }),
)
export default class RecordTable extends Component {

  static propTypes = {
    data: React.PropTypes.array.isRequired,
    schema: React.PropTypes.object.isRequired,
    creating: React.PropTypes.array,
    titleLink: React.PropTypes.bool,
    isEditable: React.PropTypes.bool,
    // TODO объединить в группу пропсов
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    itemsForPage: React.PropTypes.number,
    // absolutPath: React.PropTypes.string,
    conditionFilters: PropTypes.array,
    hasChildColumns: React.PropTypes.bool,
    onSortChange: React.PropTypes.func,
    sortColumn: React.PropTypes.string,
    sortAscending: React.PropTypes.bool,
    date: React.PropTypes.string,
    columns: React.PropTypes.array,
    //
    paintFn: PropTypes.func,
    metaCols: PropTypes.shape({}),
    diffAgainst: PropTypes.shape({}),
    hasStagedChanges: PropTypes.bool,
    inlineRemove: PropTypes.bool,
    element: PropTypes.shape({}),
  }

  static defaultProps = {
    titleLink: true,
    isEditable: false,
    creating: [],
    itemsForPage: 15,
    hasChildColumns: false,
    conditionFilters: [],
    columns: [],
    inlineRemove: false,
  }

  constructor(props) {
    super(props);

    this.state = {
      headerHeight: 0,
      tableWidth: 0,
    };
  }

  shouldComponentUpdate(nextProps) {
    const keys = union(Object.keys(this.props), Object.keys(nextProps));
    const res = keys.some(k => !isEqual(nextProps[k], this.props[k]));
    return res;
  }

  render() {
    const { itemsForPage, date, isEditable, paintFn, metaCols = {}, schema,
      titleLink, conditionFilters, columns, diffAgainst } = this.props;
    const isDiff = !!diffAgainst;
    const data = (this.props.data || []).slice().map(i => isEditable ? { ...i } : i);

    let metadata = flattenSchema(schema).map(node => ({
      columnName: node.id,
      displayName: node.title,
      customComponent: StyledComponent,
      changeRowColor: this.onChangeRowColor,

      node,
      type: node.type,
      isDiff,
      isRef: node.isRef,
      refPath: node.refPath,
      deepPath: node.deepPath,
      refElementPath: node.type === 'reference' ? node.config.key : null,
      isInlineEditable: isEditable && schema.config.isInlineEditable && (!node.isRef || node.isRefTitle),
      titleLink,
      date,

      itemSchema: node,
      itemProperties: find(schema.config.properties, p => p.id === node.id),
      ...node.config,
    })).filter(({ columnName }) => (
      isEmpty(columns) || columns.some(c => c.columnName === columnName && !c.isHidden)
    ));

    if (columns.length) {
      metadata = columns
        .filter(item => item && !item.isHidden)
        .map(item => metadata.find(col => col.columnName === item.columnName))
        .filter(col => col);
    }

    if (this.props.hasStagedChanges) {
      metadata.push({
        columnName: '$$edit',
        deepPath: ['$$edit'],
        displayName: '',
        customComponent: RecordTableSubmit,
      });
    }
    if (this.props.inlineRemove) {
      metadata.push({
        columnName: '$$removed',
        deepPath: ['$$removed'],
        displayName: '',
        customComponent: RecordTableRemove,
      });
    }

    Object.keys(metaCols).forEach((metaFieldName) => {
      const colDesc = metaCols[metaFieldName];
      const cols = colDesc.map(c => ({ ...c, deepPath: [metaFieldName, c.columnName] }));
      metadata = metadata.concat(cols);
    });

    (this.props.creating || []).forEach((i) => {
      data.unshift({
        ...i.patch,
        draftId: i.draftId,
        $$changed: true,
        isNew: true,
      });
    });

    data.forEach((el, index) => {
      el.metadata = metadata;

      if (isDiff) {
        el.diffAgainst = diffAgainst[el.$$rfcEntry.absolutPath] || {};
      }

      el.$$key = el.draftId || get(el, '$$meta.absolutPath', index);

      if (paintFn) {
        el.color = paintFn(el);
      } else {
        const filterMatch = conditionFilters.find(filter => (
          filter.statements.every(stmt => (
            Object.prototype.hasOwnProperty.call(el, stmt.key) && evalResult(el[stmt.key], stmt.condition, stmt.value)
          ))
        ));
        if (filterMatch) {
          el.color = filterMatch.color;
        }
      }
    });

    const rowMetadata = {
      bodyCssClassName(rowData) {
        if (rowData.$$meta && rowData.$$meta.isAvailable === false) {
          return 'standard-row unavailable-row';
        } else if (rowData.color) {
          return `${dictionary.colorNames[rowData.color]}-row`;
        }
        return 'standard-row';
      },
      key: '$$key',
      headerCssClassName: 'record-table__header',
      customGridRowComponent: Row,
      onChange: this.props.onChange,
      onRemove: this.props.onRemove,
      recordSchema: schema,
      element: this.props.element,
    };

    const classNames = cx('records-griddle record-table', {
      'record-table--editable': this.props.isEditable,
    });

    return (
      <div className={classNames} ref={(ref) => { this.recordTable = ref; }}>
        <Griddle
          results={data}
          useGriddleStyles={false}
          tableClassName="tablesorter"
          parentRowCollapsedComponent={<span className="aui-icon aui-icon-small aui-iconfont-collapsed" />}
          parentRowExpandedComponent={<span className="aui-icon aui-icon-small aui-iconfont-expanded" />}
          simpleRowComponent={this.props.hasChildColumns ? <span className="aui-icon aui-icon-small" /> : null}
          useCustomPagerComponent
          customPagerComponent={Paginator}
          useCustomHeaderComponent
          customHeaderComponent={NestableHeader}
          resultsPerPage={itemsForPage}
          columnMetadata={metadata}
          columns={metadata.map(col => col.columnName)}
          rowMetadata={rowMetadata}
          noDataMessage="Нет данных"
          onSortChange={this.props.onSortChange}
          externalSortColumn={this.props.sortColumn}
          externalSortAscending={this.props.sortAscending}
        />
      </div>
    );
  }

}
