import { centroid } from './ol';
import canvasLabel from './canvasLabel.js';

export const source = (olSource, distancePx = 40) => new ol.source.Cluster({
  geometryFunction: feature => centroid(feature),
  distance: distancePx,
  source: olSource,
});

export const style = (baseStyle, singleStyle) => (clusterFeature, resolution) => {
  const features = clusterFeature.get('features');
  const clusterSize = features.length;
  const clusterRepr = features[0];

  const safeStyle = (creator) => {
    const instance = creator instanceof Function
      ? creator(clusterRepr, resolution, clusterFeature)
      : creator;
    if (!instance) return [];
    return Array.isArray(instance) ? instance : [instance];
  };

  // Кластеры из 1 фичи рисовать как просто фичу
  if (clusterSize === 1) {
    return safeStyle(baseStyle).concat(safeStyle(singleStyle).map((s) => {
      const positioned = s.clone();
      // У самого кластера нет геометрии
      positioned.setGeometry(clusterRepr.getGeometry());
      return positioned;
    }));
  }

  // Иконка + количество фич в кластере
  return safeStyle(baseStyle).concat(canvasLabel(clusterSize));
};

export const isCluster = feature => !!feature.get('features');

export const isSingularCluster = feature => (
  isCluster(feature) && feature.get('features').length === 1
);

export const isRealCluster = feature => (
  isCluster(feature) && feature.get('features').length > 1
);

export const getClickableFeature = (feature) => {
  if (!isCluster(feature)) {
    return feature;
  }
  if (isSingularCluster(feature)) {
    return feature.get('features')[0];
  }
  return null;
};

export const getClickableClusterFeature = (feature, layer) => {
  if (isSingularCluster(feature)) {
    return {
      cFeature: feature,
      layerFeatureIsIn: layer,
    };
  }
  return null;
};
