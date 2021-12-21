import React, { PropTypes } from 'react';
import { magnify, unmagnify } from '../utils/openlayers/magnify';

export default MapComponent => class MapWithMagnify extends React.Component {

  static propTypes = {
    onFeatureClick: PropTypes.func,
  }

  featureSelected = undefined

  onFeatureClick = (feature, cFeatureAndLAyer, evt, mapComponentContext) => {
    unmagnify(this.featureSelected);
    this.featureSelected = undefined;
    if (cFeatureAndLAyer && cFeatureAndLAyer.layerFeatureIsIn && cFeatureAndLAyer.cFeature) {
      this.featureSelected = cFeatureAndLAyer.cFeature;
      magnify(mapComponentContext.map, cFeatureAndLAyer.layerFeatureIsIn, cFeatureAndLAyer.cFeature, 1.3);
    }

    if (typeof this.props.onFeatureClick === 'function') {
      this.props.onFeatureClick(feature, evt, cFeatureAndLAyer, mapComponentContext);
    }
  }

  onFeatureHoverEnter = (hoveredCluster, layerFeatureIsIn, evt, mapComponentContext) => {
    magnify(mapComponentContext.map, layerFeatureIsIn, hoveredCluster, 1.3);

    this.props.onFeatureHoverEnter(hoveredCluster, layerFeatureIsIn, evt, mapComponentContext);
  }

  onFeatureHoverExit = (feature, ...args) => {
    unmagnify(feature);

    this.props.onFeatureHoverExit(feature, ...args);
  }

  render() {
    return (
      <MapComponent
        {...this.props}
        // onFeatureClick={this.onFeatureClick}
        onFeatureHoverExit={this.onFeatureHoverExit}
        onFeatureHoverEnter={this.onFeatureHoverEnter}
      />
    );
  }
};
