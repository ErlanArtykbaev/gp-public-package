
import { hexToRgba } from '@gostgroup/gp-constructor/lib/utils/colors';
import { defaultValue as coreDefaultPolygonStyle } from '@gostgroup/gp-constructor/lib/components/editors/geojson/StyleEditor';
import { centroid, calculateProjectedRadiusLength } from './ol';
import { featureIsPoly } from './featureUtils';
import individualStyle from './individualStyle';

export const DEFAULT_POINT_STYLE = new ol.style.Style({
  image: new ol.style.Circle({
    stroke: new ol.style.Stroke({
      color: 'black',
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: 'white',
    }),
    radius: 12,
  }),
});

export const DEFAULT_POLYGON_STYLE = individualStyle(coreDefaultPolygonStyle);

export const FAST_POLYGON_STYLE = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'red',
    opacity: 0.6,
  }),
});

export const EMPTY_STYLE = new ol.style.Style({});

export function radiusStyleFunction(feature, resolution, area) {
  const { properties, radius } = area;
  const projectedRadius = calculateProjectedRadiusLength(feature, radius);

  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: properties.borderColor || 'red',
      width: properties.borderWidth || 2,
    }),
    fill: new ol.style.Fill({
      color: hexToRgba(properties.fillColor || '#FF0000', properties.fillTransparency || 0.1, true),
    }),
    geometry: new ol.geom.Circle(centroid(feature).getCoordinates(), projectedRadius),
  });
}

export const polyStyle = (feature, resolution) => {
  const ownStyle = feature.getStyle();
  // почему так?
  if (ownStyle) return ownStyle;

  // NOTE стоит считать линейную метрику, а не площадь
  // NOTE эти адаптивные стили только для полигонов
  if (!featureIsPoly(feature)) return DEFAULT_POLYGON_STYLE;
  if (feature.get('area') < 30 * resolution) return EMPTY_STYLE;
  if (feature.get('area') < 100 * resolution) return FAST_POLYGON_STYLE;
  return DEFAULT_POLYGON_STYLE;
};
