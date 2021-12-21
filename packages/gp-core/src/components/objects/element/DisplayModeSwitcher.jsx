import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import DISPLAY_MODE from 'gp-core/lib/constants/element/displayMode';
import cx from 'classnames';
import uniqBy from 'lodash/uniqBy';

@autobind
export default class DisplayModeSwitcher extends Component {

  static propTypes = {
    displayMode: PropTypes.string,
    currentParent: PropTypes.string,
    parentColumns: PropTypes.array,
    handleDisplayModeChange: PropTypes.func.isRequired,
    handleParentChange: PropTypes.func.isRequired,

  }

  constructor() {
    super();
    this.handleParentChange = this.handleParentChange.bind(this);
  }

  handleDisplayModeChange(displayMode) {
    if (this.props.handleDisplayModeChange) {
      this.props.handleDisplayModeChange(displayMode);
    }
  }

  handleParentChange(e) {
    if (this.props.handleParentChange) {
      this.props.handleParentChange(e.target.value);
    }
  }

  render() {
    const { displayMode, parentColumns } = this.props;
    const treeButtonClass = cx('aui-button', {
      active: displayMode === DISPLAY_MODE.TREE_VIEW,
    });

    const tableButtonClass = cx('aui-button', {
      active: displayMode === DISPLAY_MODE.TABLE_VIEW,
    });

    const options = uniqBy(parentColumns, 'id')
      .map((column) => {
        if (column.children) {
          return column.children.map(item => <option value={`${column.id}/${item.id}`} key={`${column.id}/${item.id}`}>{`${column.title} - ${item.title}`}</option>);
        }
        return <option value={column.id} key={column.id}>{column.title}</option>;
      });

    return (
      <form className="aui" style={{ marginBottom: 20 }} onSubmit={e => e.preventDefault()}>
        <p className="aui-buttons" style={{ marginRight: 20 }}>
          <button
            className={treeButtonClass}
            onClick={this.handleDisplayModeChange.bind(this, DISPLAY_MODE.TREE_VIEW)}
            title="Иерархический режим"
          >
            <span className="aui-icon aui-icon-small aui-iconfont-nav-children" />
          </button>
          <button
            className={tableButtonClass}
            onClick={this.handleDisplayModeChange.bind(this, DISPLAY_MODE.TABLE_VIEW)}
            title="Табличный режим"
          >
            <span className="aui-icon aui-icon-small aui-iconfont-editor-table" />
          </button>
        </p>
        <label htmlFor="parentField" style={{ marginRight: 10 }}>Родительское поле</label>
        <select
          name="parentField"
          id="parentField"
          className="select"
          disabled={this.props.displayMode === DISPLAY_MODE.TABLE_VIEW}
          value={this.props.currentParent} onChange={this.handleParentChange}
        >
          {options}
        </select>
      </form>
    );
  }

}
