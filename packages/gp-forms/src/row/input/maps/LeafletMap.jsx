import React, { PropTypes } from 'react';
import GJV from 'geojson-validation';
import flattenDeep from 'lodash/flattenDeep';
import L from 'leaflet';
import 'leaflet-draw';
import drawControlOptions from './drawControlOptions.js';
import setMarkerIcon from './markerIcon.js';
import applyDrawLocal from './leaflet-draw-local.js';
import './leafletMap.global.scss';

applyDrawLocal(L);
setMarkerIcon(L);

function validFeatureFilter(feature) {
  const flattenedCoordinates = flattenDeep(feature.geometry.coordinates);
  const filteredCoordinates = flattenedCoordinates.filter(c => !!parseFloat(c));
  return flattenedCoordinates.length === filteredCoordinates.length;
}

export default class LeafletMap extends React.Component {

  static propTypes = {
    config: PropTypes.object,
    geoJson: PropTypes.object,
    readOnly: PropTypes.bool,
    onGeoJSONChange: PropTypes.func,
  }

  componentDidMount() {
    const { config, geoJson, readOnly } = this.props;

    if (GJV.valid(geoJson)) {
      this.editableLayers = new L.geoJson({ // eslint-disable-line new-cap
        ...geoJson,
        features: geoJson.features.filter(validFeatureFilter),
      });
    } else {
      this.editableLayers = new L.geoJson(); // eslint-disable-line new-cap
    }

    const map = this.map = L.map(this.node, {
      center: config.center,
      zoom: config.zoom,
      minZoom: 2,
      maxZoom: 20,
      layers: [
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
        this.editableLayers,
      ],
      controls: [],
      attributionControl: false,
    });

    if (!readOnly) {
      this.enableDraw();
    }

    map.addLayer(this.editableLayers);
  }

  enableDraw() {
    const { map } = this;
    const drawControl = new L.Control.Draw(drawControlOptions(this.editableLayers));
    map.addControl(drawControl);

    map.on('draw:created', ({ layer }) => {
      this.editableLayers.addLayer(layer);
      this.props.onGeoJSONChange(this.editableLayers.toGeoJSON());
    });

    map.on('draw:edited', () => {
      this.props.onGeoJSONChange(this.editableLayers.toGeoJSON());
    });

    map.on('draw:deleted', () => {
      this.props.onGeoJSONChange(this.editableLayers.toGeoJSON());
    });
  }

  render() {
    return (
      <div ref={node => (this.node = node)} style={{ height: 550 }} />
    );
  }

}
