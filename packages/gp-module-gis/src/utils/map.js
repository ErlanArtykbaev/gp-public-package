import _map from 'lodash/map';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { readWGSGeometry } from './openlayers/ol.js';
import { featureIconStyle, getFeatureGroup, featureIsPoly, featureIsPoint, featureIsLine } from './openlayers/featureUtils';
import { polyStyle } from './openlayers/featureStyles';
import { cluster, individualStyle } from './openlayers';

const commonObjStatus = (ids) => {
  // Возвращаем статус только если у всех одинаковый.
  // Можно добавить приоритеты (один объект в опасности -- кластер в опасности)
  if (ids.every(id => id === ids[0])) {
    return ids[0];
  }
  return null;
};

const getArrayField = (source, key) => {
  source[key] = source[key] || [];
  return source[key];
};

const zIndexCounters = {
  point: 900,
  line: 800,
  poly: 700,
};
const smartZIndex = (source) => {
  const typedZIndex = t => zIndexCounters[t];
  if (source.forEachFeature(featureIsPoint)) return typedZIndex('point');
  if (source.forEachFeature(featureIsLine)) return typedZIndex('line');
  return typedZIndex('poly');
};

const defFeatureEqual = (f, d) => isEqual(f.get('data'), d);

export class Map extends ol.Map {

  static createVectorLayers(features, options = {}) {
    const typedFeatures = {};
    const callback = options.onAdd;

    Object.keys(features).forEach((key) => {
      const poly = features[key];
      // TODO internal registration
      const oldFeature = get(options.reuseFeatures, key);
      const typeKey = poly.typeKey || poly.icon || 'NO_TYPE';
      const featureChanged = oldFeature && !(options.isFeatrueEqual || defFeatureEqual)(oldFeature, poly);

      let feature;
      if (oldFeature && !featureChanged) {
        feature = oldFeature;
      } else {
        feature = new ol.Feature({
          ...poly,
          data: poly, // чтобы сравнивать при переиспользовании
          geometry: readWGSGeometry(poly.geometry),
        });
        if (featureIsPoly(feature)) {
          feature.set('area', feature.getGeometry().getArea());
        }
        feature.setStyle(individualStyle(poly.styleProperties));

        if (typeof callback === 'function') {
          callback(feature, typeKey, key, poly);
        }
        if (options.registry) {
          options.registry[key] = feature;
        }
      }
      getArrayField(typedFeatures, typeKey).push(feature);
    });

    const groupFunction = options.groupFunction || (s => s.forEachFeature(f => getFeatureGroup(f)));
    const typeFunction = options.typeFunction || (s => s.forEachFeature(f => f.get('typeKey')));
    const useClusters = typeof options.useClusters === 'boolean'
      ? () => options.useClusters
      : options.useClusters || (f => featureIsPoint(f[0]));
    const forceIcon = get(options, 'forceIcon', false);

    const clusterBaseStyle = options.styleFunction || ((item, resolution, clust) => {
      const isCluster = cluster.isRealCluster(clust);
      if (!(isCluster || forceIcon || featureIsPoint(item))) return null;
      const status = commonObjStatus(clust.get('features').map(f => f.get('statusId')));
      return featureIconStyle(item, status, isCluster);
    });

    return _map(typedFeatures, (features, type) => {
      const style = options.styleFunction || individualStyle(options.styleProperties) || polyStyle;
      const isLayerClustered = useClusters(features);
      const isLayerPoly = featureIsPoly(features[0]);

      const reuseLayer = (options.reuseLayers || []).find(l => l.get('type') === type);
      const source = new ol.source.Vector({
        overlaps: !!isLayerPoly, // line и point не overlap, ol обещает оптимизацию
        features,
      });

      const layer = reuseLayer || new ol.layer.Vector({
        group: groupFunction(source),
        type: typeFunction(source),
        zIndex: options.zIndex || smartZIndex(source),
      });
      layer.setSource(isLayerClustered ? cluster.source(source) : source);
      layer.setStyle(isLayerClustered ? cluster.style(clusterBaseStyle, style) : style);
      return layer;
      // NOTE: ol.source.ImageVector это интересно, хотя при зуме выглядит херово
    });
  }

  clearLayers(layers = []) {
    layers.forEach(layer => this.removeLayer(layer));
  }

  addLayers(layers = []) {
    layers.forEach(layer => this.addLayer(layer));
  }

  removeLayerByKey(key) {
    const removeLayer = this.getLayers().getArray().filter(l => l.getProperties().name === key);
    removeLayer[0] && this.removeLayer(removeLayer[0]);
  }
}

let map = null;

// TODO create Map factory to allow multiple maps usage
export function createMap(object) {
  if (typeof object !== 'object') {
    throw new Error('Map should be object or null');
  }
  if (object !== null) {
    map = new Map(object);
    map.setProperties({
      featuresList: {},
    });
  } else {
    map = null;
  }
  return map;
}

export default () => map;
