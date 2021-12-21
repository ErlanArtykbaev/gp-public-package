import React, { PropTypes } from 'react';
import GridTitle from 'griddle-react/modules/gridTitle';
import range from 'lodash/range';
import get from 'lodash/get';

const griddleStyle = () => ({
  backgroundColor: '#EDEDEF',
  border: '0',
  borderBottom: '1px solid #DDD',
  color: '#222',
  padding: '5px',
});

const thSortable = {
  cursor: 'pointer',
};

export class Header extends React.Component {

  static propTypes = {
    schema: PropTypes.arrayOf(
      PropTypes.shape({
        node: PropTypes.shape({
          isLeaf: PropTypes.bool,
          leaves: PropTypes.arrayOf(PropTypes.shape({})),
          parents: PropTypes.arrayOf(PropTypes.shape({})),
        }),
      })
    ),
    visibleCols: PropTypes.arrayOf(PropTypes.string),
    headerStyles: PropTypes.shape({}),
    className: PropTypes.string,
    styles: PropTypes.shape({
      th: PropTypes.shape({}),
      thSortable: PropTypes.shape({}),
    }),
  }

  render() {
    const { visibleCols, schema, headerStyles, className, styles } = this.props;
    const depth = Math.max(...schema.map(c => get(c.node, 'depth', 0)));
    const treeRows = range(depth).map(() => []);

    schema.filter(col => !!col.node).forEach((col) => {
      const leaf = col.node;
      leaf.parents.concat(leaf).forEach((node) => {
        const row = treeRows[node.depth - 1];
        if (!row.includes(node)) row.push(node);
      });
    });

    // order
    const atomicHeader = visibleCols.map((col) => {
      const columnIsSortable = this.props.columnSettings.getMetadataColumnProperty(col, 'sortable', true);

      let columnSort = '';
      let sortComponent = null;
      const titleStyles = {
        ...styles.th,
        ...(columnIsSortable ? styles.thSortable : {}),
      };

      if (this.props.sortSettings.sortColumn === col && this.props.sortSettings.sortAscending) {
        columnSort = this.props.sortSettings.sortAscendingClassName;
        sortComponent = this.props.useGriddleIcons && this.props.sortSettings.sortAscendingComponent;
      } else if (this.props.sortSettings.sortColumn === col && this.props.sortSettings.sortAscending === false) {
        columnSort += this.props.sortSettings.sortDescendingClassName;
        sortComponent = this.props.useGriddleIcons && this.props.sortSettings.sortDescendingComponent;
      }

      const meta = this.props.columnSettings.getColumnMetadataByName(col) || {};
      const displayName = this.props.columnSettings.getMetadataColumnProperty(col, 'displayName', col);

      columnSort = meta == null ? columnSort : (columnSort ? `${columnSort} ` : '') + this.props.columnSettings.getMetadataColumnProperty(col, 'cssClassName', '');

      return (
        <th
          onClick={columnIsSortable ? this.props.sort : null}
          data-title={col}
          className={columnSort}
          key={col}
          style={titleStyles}
        >
          {displayName}{sortComponent}
          <div>
            {displayName}{sortComponent}
          </div>
        </th>
      );
    });

    const tree = treeRows.map((colsOnLevel, level) => (
      <tr key={level} className={className} style={headerStyles}>
        {colsOnLevel.map((node) => {
          const rowSpan = node.isLeaf ? depth - node.depth : 1;
          const colSpan = node.leaves.filter(l => visibleCols.includes(l.id)).length;
          if (rowSpan === 0) return null;
          return (
            <th
              key={node.deepPath}
              style={styles.th}
              colSpan={colSpan}
              rowSpan={rowSpan}
            >
              {!node.isLeaf && node.title}
            </th>
          );
        })}
      </tr>
    ));

    return (
      <thead>
        {tree}
        <tr className={className} style={headerStyles}>{atomicHeader}</tr>
      </thead>
    );
  }

}

export default class NestableHeaderGriddle extends GridTitle {

  static propTypes = {
    sortSettings: PropTypes.shape({
      sortColumn: PropTypes.string,
      sortAscending: PropTypes.bool,
      sortAscendingClassName: PropTypes.string,
      sortDescendingClassName: PropTypes.string,
      sortDescendingComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
      sortAscendingComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    }),
  }

  // TODO implement
  // getSortComponent = () => {
  //   let sortComponent = null;
  //   let columnSort = '';
  //   if (this.props.sortSettings.sortAscending) {
  //     columnSort = this.props.sortSettings.sortAscendingClassName;
  //     sortComponent = this.props.useGriddleIcons && this.props.sortSettings.sortAscendingComponent;
  //   } else if (this.props.sortSettings.sortColumn === col && this.props.sortSettings.sortAscending === false) {
  //     columnSort += this.props.sortSettings.sortDescendingClassName;
  //     sortComponent = this.props.useGriddleIcons && this.props.sortSettings.sortDescendingComponent;
  //   }
  //
  //   return sortComponent;
  // }

  render() {
    this.verifyProps();
    // Get the row from the row settings.
    const className = this.props.rowSettings ? this.props.rowSettings.getHeaderRowMetadataClass() : null;

    return (
      <Header
        {...this.props}
        styles={{
          th: this.props.useGriddleStyles ? griddleStyle() : {},
          thSortable,
        }}
        sort={this.sort}
        schema={this.props.columnSettings.columnMetadata}
        visibleCols={this.props.columnSettings.getColumns()}
        headerStyles={this.props.headerStyles}
        className={className}
      />
    );
  }
}
