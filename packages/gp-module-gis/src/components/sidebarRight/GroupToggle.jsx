import React, { Component, PropTypes } from 'react';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import SidebarItemsInnerGroup from './SidebarItemsInnerGroup';

export default class GroupToggle extends Component {
  static propTypes = {
    title: PropTypes.string,
    active: PropTypes.bool,
    minimal: PropTypes.bool,
    initialSort: PropTypes.string,
    onClick: PropTypes.func,
    innerGroups: PropTypes.arrayOf(PropTypes.shape({})),
    selectedLayers: PropTypes.shape({}),
  }

  state = {
    sort: null,
  }

  render() {
    // TODO refactor...
    const { active, onClick, minimal, innerGroups, selectedLayers } = this.props;
    const sort = this.state.sort || this.props.initialSort || 'title';
    const title = minimal ? this.props.title[0] : this.props.title;
    return (
      <div className={active ? 'sidebar-group open' : 'sidebar-group'}>
        <div className="sidebar-group-toggle" onClick={onClick}>
          {title}
          <Glyphicon glyph={active ? 'triangle-bottom' : 'triangle-right'} />
        </div>
        {!minimal && <div className="sidebar-group-sort-panel">
          <div className="styled-select">
            <select value={sort} onChange={e => this.setState({ sort: e.target.value })}>
              <option value="title">Сортировка по имени</option>
              <option value="group">Сортировка по типу</option>
              <option value="state">Сортировка по состоянию</option>
            </select>
          </div>
          {/* <div className="styled-checkbox">
            <input type="checkbox" checked={checked} onChange={() => this.toggleAll(!checked)} />
          </div> */}
        </div>}
        <div className="sidebar-group-elements">
          {innerGroups.map(t => (
            <SidebarItemsInnerGroup
              key={t.id}
              innerGroup={t}
              minimal={minimal}
              selectedLayers={selectedLayers[t.id]}
            />
          ))}
        </div>
      </div>
    );
  }
}
