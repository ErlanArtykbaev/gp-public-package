
import { GeoJSONFeature, GeoJSONFeatureCollection } from '@gostgroup/gp-utils/lib/GeoJSON';

// Надо убрать их в константы
const WGS84 = 'EPSG:4326';
const WGS84PSEUDO = 'EPSG:3857';

export const GeoJSON = new ol.format.GeoJSON();

export function readWGSGeometry(geometry) {
  return GeoJSON.readGeometry(geometry, {
    dataProjection: WGS84,
    featureProjection: WGS84PSEUDO,
  });
}

export function writeWGSFeatures(features) {
  return GeoJSON.writeFeatures(features, {
    dataProjection: WGS84,
    featureProjection: WGS84PSEUDO,
  });
}

export function readWGSFeatures(geometry) {
  return GeoJSON.readFeatures(geometry, {
    dataProjection: WGS84,
    featureProjection: WGS84PSEUDO,
  });
}

export function transformToWGS(coordinates) {
  return ol.proj.transform(coordinates, WGS84PSEUDO, WGS84);
}

export function transformToWGSString(coordinates) {
  return ol.proj.transform(coordinates, WGS84PSEUDO, WGS84).reverse().join(', ');
}

export function transformFromWGS(coordinates) {
  return ol.proj.transform(coordinates, WGS84, WGS84PSEUDO);
}

const wgs84Sphere = new ol.Sphere(6378137);
export function calculateProjectedRadiusLength(feature, radius) {
  const center = feature.getGeometry().getCoordinates();
  const edgeCoordinate = [center[0] + radius, center[1]];
  const displayRadius = wgs84Sphere.haversineDistance(
    ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326'),
    ol.proj.transform(edgeCoordinate, 'EPSG:3857', 'EPSG:4326')
  );
  const rescale = radius / displayRadius;
  return rescale * radius;
}

export function centroid(feature) {
  return new ol.geom.Point(ol.extent.getCenter(feature.getGeometry().getExtent()));
}

export function getGeometryDistanceInfo(vector, map) {
  let length = 0;
  // Default measure
  // length = Math.round(line.getLength() * 100) / 100;
  // Geodesic measure
  const coordinates = vector.getCoordinates();
  const sourceProj = map.getView().getProjection();
  for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
    const c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
    const c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
    length += wgs84Sphere.haversineDistance(c1, c2);
  }

  let output;
  if (length > 100) {
    output = `${Math.round((length / 1000) * 100) / 100} км`;
  } else {
    output = `${Math.round(length * 100) / 100} м`;
  }
  return {
    str: output,
    value: length,
  };
}

export const wrapCoord = c => new GeoJSONFeatureCollection([
  GeoJSONFeature.Point(c), // eslint-disable-line new-cap
]);
