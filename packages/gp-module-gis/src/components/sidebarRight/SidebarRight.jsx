import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { connect } from 'react-redux';
import { toggle } from '@gostgroup/gp-core/lib/modules/map/redux/modules/gis';
import { sidebarIsOpenSelector, layersSelector, selectedLayersSelector } from '@gostgroup/gp-core/lib/modules/map/redux/selectors/gis';

import searchable from '@gostgroup/gp-hocs/lib/searchable';
import callWithEvent from '@gostgroup/gp-hocs/lib/callWithEvent';
import cx from 'classnames';
import './dashboardSidebarRight.global.scss';
import GroupToggle from './GroupToggle';

@connect(
  state => ({
    isOpen: sidebarIsOpenSelector(state),
    groups: layersSelector(state),
    selectedLayers: selectedLayersSelector(state),
  }),
  { toggle }
)
@searchable
@callWithEvent('toggle', 'resize')
@autobind
export default class Sidebar extends React.Component {

  static propTypes = {
    selectedTypes: PropTypes.object,
    query: PropTypes.string,
    setQuery: PropTypes.func,
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    geoObjectsActions: PropTypes.shape({}),
    groups: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.string,
      innerGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        layers: PropTypes.arrayOf(PropTypes.shape({
          title: PropTypes.string,
          id: PropTypes.number,
          iconUrl: PropTypes.string,
        })),
      })),
    })),
    selectedLayers: PropTypes.shape({}),
  }

  state = {
    active: ['static'],
  }

  handleFocusSearch() {
    const e = document.getElementById('sidebar-search');
    e.focus();
  }

  selectType(type, force) {
    const { selectedTypes, geoObjectsActions } = this.props;
    const { group } = type;
    const groupTypes = selectedTypes[group] || [];
    const alreadyChecked = groupTypes.indexOf(type.id) > -1;
    if (!alreadyChecked && group !== 'situation') {
      geoObjectsActions.requestGetGeoObjects(group, type);
    }
    if ((force === true && !alreadyChecked) || !force) {
      geoObjectsActions.selectType(group, type.id);
    }
  }

  toggle = () => this.props.toggle('sidebarRight')

  render() {
    const { query, isOpen, groups } = this.props;
    const defaultClassName = 'dashboard-sidebar-right';
    const mainClassName = cx(defaultClassName, { [`${defaultClassName}-open`]: isOpen, [`${defaultClassName}-closed`]: !isOpen });
    const toggleGlyph = !isOpen ? 'backward' : 'forward';
    return (
      <div className={mainClassName}>
        <div className="dashboard-sidebar-toggle" onClick={this.toggle}>
          <Glyphicon glyph={toggleGlyph} />
        </div>
        {isOpen && <div className="dashboard-sidebar-right-draggable-zone">
          <input id="sidebar-search" type="text" value={query} placeholder="поиск" onChange={this.props.setQuery} />
        </div>}
        <div className="dashboard-sidebar-right-scrollable-container">
          {groups.map(g => (
            <GroupToggle
              key={g.key}
              title={g.title}
              innerGroups={g.innerGroups}
              selectedLayers={this.props.selectedLayers}
              active
              minimal={!isOpen}
              // initialSort={'group'}
              onSelect={this.selectGroup}
            />
          ))}
        </div>
      </div>
    );
  }
}
