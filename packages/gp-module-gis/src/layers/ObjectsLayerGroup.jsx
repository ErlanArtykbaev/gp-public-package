import React from 'react';
import { connect } from 'react-redux';
import { getGroupLayers } from '../redux/selectors/gis';
// import { getSelectedPolys, getLayerStyle } from 'bg/redux/selectors/geoObjects';

import { Map } from '../utils/map';
import mapLayer from '../mapLayer';

const ObjectsLayer = mapLayer(({ features, map, styleProperties }) =>
  Map.createVectorLayers(features, {
    styleProperties,
    registry: map.get('featuresList'),
  })
);

const ObjectsLayerGroup = p => (<span>
  {p.layers.map((layer, index) =>
    <ObjectsLayer key={String(index)} {...p} features={layer.features} />
  )}
</span>);

export default connect(
  state => ({ layers: getGroupLayers(state)(1) })
)(ObjectsLayerGroup);
