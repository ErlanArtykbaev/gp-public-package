import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { selectLayer } from '../../redux/modules/gis';
import SidebarItem from './SidebarItem';

@connect(
  null,
  { onClick: selectLayer },
)
export default class SidebarItemsInnerGroup extends React.Component {

  onClick = (...args) => this.props.onClick(
    this.props.innerGroup.url,
    this.props.innerGroup,
    ...args,
  )

  render() {
    const { innerGroup, minimal, selectedLayers = [] } = this.props;
    return (
      <div>
        {!minimal && <div className="divider">
          {innerGroup.title}
          {/* <div className="styled-checkbox">
            <input type="checkbox" checked={type.active} onChange={() => this.toggleAll(!type.active, type.id)} />
          </div> */}
        </div>}
        {innerGroup.layers.map(item => (
          <SidebarItem
            key={`${innerGroup.id}.${item.id}`}
            item={item}
            active={selectedLayers.includes(item.id)}
            minimal={minimal}
            onClick={this.onClick}
          />
        ))}
      </div>
    );
  }
}

SidebarItemsInnerGroup.propTypes = {
  innerGroup: PropTypes.shape({
    id: PropTypes.number,
    key: PropTypes.string,
    url: PropTypes.string,
  }),
  onClick: PropTypes.func,
  minimal: PropTypes.bool,
  selectedLayers: PropTypes.arrayOf(PropTypes.number),
};
