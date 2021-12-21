import React, { Component, PropTypes } from 'react';
import { cluster, OSMLayer, TileLayer } from './utils/openlayers';
import { transformFromWGS } from './utils/openlayers/ol';
import getTarget from './utils/getTarget';
import fitFeatures from './utils/openlayers/fitFeatures';
import { createMap } from './utils/map';
import styles from './Map.scss';
import magnify from './compositions/magnify';
import popup from './compositions/popup';

@popup
@magnify
export default class OpenLayersMap extends Component {

  static contextTypes = {
    store: PropTypes.shape({}),
  }

  static propTypes = {
    onFeatureClick: PropTypes.func,
    onFeatureHoverEnter: PropTypes.func,
    onFeatureHoverExit: PropTypes.func,
    initialView: PropTypes.shape({
      center: PropTypes.arrayOf(PropTypes.number),
      zoom: PropTypes.number,
    }),
    tileLayerConfig: PropTypes.shape({
      TILES_URL: PropTypes.string,
      MapServerConfig: PropTypes.shape({}),
    }),
    baseLayers: PropTypes.arrayOf(PropTypes.shape({})),
    children: PropTypes.node,
  }

  constructor(props, context) {
    super(props, context);

    this.createMap();
    this.state = {
      contextMenu: true,
    };

    this.featureHovered = undefined;
  }

  componentDidMount() {
    this.enableInteractions();
    this.map.setTarget(this._container);
  }

  componentWillUnmount() {
    createMap(null);
  }

  onMouseMove(ev) {
    if (ev.originalEvent.target.className !== 'ol-unselectable') {
      this.map.getViewport().style.cursor = '';
      return;
    }
    const map = this.map;
    const changeCursor = false;

    const hovered = getTarget(map, ev.pixel);
    const hoveredCluster = hovered.feature;
    const layerFeatureIsIn = hovered.layer;

    const validHover = hoveredCluster && layerFeatureIsIn;
    const hoverEnter = validHover && hoveredCluster !== this.featureHovered;
    const hoverExit = (!validHover && this.featureHovered) || (hoverEnter && this.featureHovered);
    if (hoverExit) {
      if (typeof this.props.onFeatureHoverExit === 'function') {
        this.props.onFeatureHoverExit(this.featureHovered, ev, this);
      }
      this.featureHovered = undefined;
    }
    if (hoverEnter) {
      if (typeof this.props.onFeatureHoverExit === 'function') {
        this.props.onFeatureHoverEnter(hoveredCluster, layerFeatureIsIn, ev, this);
      }
      this.featureHovered = hoveredCluster;
    }

    const el = map.getViewport();
    el.style.cursor = changeCursor || hoveredCluster ? 'pointer' : '';
  }

  onClick(evt) {
    if (evt.originalEvent.target.className !== 'ol-unselectable') return;
    const { map } = this;
    const singleFeature = getTarget(map, evt.pixel, cluster.getClickableFeature).feature;
    const cFeatureAndLAyer = map.forEachFeatureAtPixel(evt.pixel, (f, l) => cluster.getClickableClusterFeature(f, l));
    if (singleFeature && typeof this.props.onFeatureClick === 'function') {
      this.props.onFeatureClick(singleFeature, cFeatureAndLAyer, evt, this);
      return;
    }

    const clusterFeature = map.forEachFeatureAtPixel(evt.pixel, f => (
      cluster.isCluster(f) && !cluster.isSingularCluster(f) ? f : null
    ));

    if (clusterFeature) {
      this.zoomCluster(clusterFeature);
      return;
    }
  }

  zoomCluster(clusterFeature) {
    fitFeatures(this.map, clusterFeature.get('features'));
  }

  createMap() {
    this.markers = {}; // container for markers on map
    this.layers = {};
    this.popups = {};
    this._handlers = null; // container for map event handlers

    const baseLayer = this.props.tileLayerConfig ? TileLayer(this.props.tileLayerConfig) : OSMLayer; // eslint-disable-line new-cap

    this.map = createMap({
      renderer: ['canvas', 'dom'],
      // controls: [olControls.zoomControl,  olControls.scaleLine],
      layers: [baseLayer],
      view: new ol.View({
        center: transformFromWGS(this.props.initialView.center),
        zoom: this.props.initialView.zoom,
      }),
    });
  }

  enableInteractions() {
    const map = this.map;
    const interactions = map.getInteractions();

    if (this._handlers === null) {
      this._handlers = {
        singleclick: map.on('singleclick', this.onClick.bind(this)),
        pointermove: map.on('pointermove', this.onMouseMove.bind(this)),
      };

      interactions.forEach((interaction) => {
        interaction.setActive(true);
      });
    }
  }

  extractRef = (node) => {
    this._container = node;
  }

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <div ref={this.extractRef} id="map" className={styles.map}>
          {this.props.children}
          <div className="geo-tools-panel">
            {/* <Measurer onToggleContext={s => this.setContextMenu(s)} />
            <GeoTools /> */}
          </div>
        </div>
      </div>
    );
  }
}
