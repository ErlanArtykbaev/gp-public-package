
import memoize from 'lodash/memoize';
import { DEFAULT_POINT_STYLE } from './featureStyles.js';
import getMapIconByType from './olIcons.js';
import makeTriangle from './makeTriangle';
import degToRad from './degToRad';
import { centroid } from './ol';

class ObjStatusUtils {
  static getById(e) {
    return e;
  }
}

export const makeStatusRing = memoize(
  color => [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 15,
        stroke: new ol.style.Stroke({ color, width: 4 }),
      }),
      zIndex: 30,
    }),
  ]
);

// const makeCameraStyle = (feature) => {
//   const canvas = makeTriangle(feature.get('angle'));
//   const rotation = feature.get('direction') + feature.get('rotation');
//   const style = new ol.style.Style({
//     image: new ol.style.Icon(({
//       rotation: degToRad(-rotation),
//       anchor: [0.5, 0.5],
//       img: canvas,
//       imgSize: [canvas.width, canvas.height],
//     })),
//   });
//   return style;
// };

const statusStyle = (statusId) => {
  const status = ObjStatusUtils.getById(statusId);
  return status ? makeStatusRing(status.color) : makeStatusRing('#00a390');
};

export const featureBaseStyle = (feature) => {
  const typeKey = feature.get('typeKey');
  const iconSize = feature.get('iconSize');
  const icon = feature.get('icon');
  // TODO minor refactoring is needed
  const baseStyle = icon ? [DEFAULT_POINT_STYLE, ...getMapIconByType(icon, iconSize)] : getMapIconByType(typeKey, iconSize);
  return baseStyle;
};

export const featureIconStyle = (feature, statusId, isCluster) => {
  const baseStyle = featureBaseStyle(feature);
  return baseStyle.concat(statusStyle(statusId));
};

// Иконка + статус на фиче любого типа (полигон, линия, точка)
// Медленно, тк стили клонируются с нужной геометрией
export const safeIconStyle = (f, ...args) => {
  const fCenter = centroid(f);
  return featureIconStyle(f, ...args).map((s) => {
    const ptStyle = s.clone();
    ptStyle.setGeometry(fCenter);
    return ptStyle;
  });
};

export const getFeatureGroup = feature => feature.get('featureId').split('-')[0];

export const sameFeature = (f1, f2) => f1 && f2 && f1.get('featureId') === f2.get('featureId');

export const featureIsPoint = (f) => {
  const type = f.getGeometry().getType();
  return type === 'Point' || type === 'MultiPoint';
};

export const featureIsPoly = (f) => {
  const type = f.getGeometry().getType();
  return type === 'Polygon' || type === 'MultiPolygon';
};

export const featureIsLine = (f) => {
  const type = f.getGeometry().getType();
  return type === 'LineString' || type === 'MultiLineString';
};
