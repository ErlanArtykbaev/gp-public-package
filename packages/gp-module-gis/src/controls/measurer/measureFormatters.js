const wgs84Sphere = new ol.Sphere(6378137);

/**
 * format length output
 * @param {ol.geom.Polygon} polygon
 * @return {string}
 */
export const formatArea = (polygon, map) => {
  // Default measure
  // const area = polygon.getArea();
  // Geodesic measure
  const sourceProj = map.getView().getProjection();
  const geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(
              sourceProj, 'EPSG:4326'));
  const coordinates = geom.getLinearRing(0).getCoordinates();
  const area = Math.abs(wgs84Sphere.geodesicArea(coordinates));

  let output;
  if (area > 10000) {
    output = `${Math.round((area / 1000000) * 100) / 100} км<sup>2</sup>`;
  } else {
    output = `${Math.round(area * 100) / 100} м<sup>2</sup>`;
  }
  return output;
};

/**
 * format length output
 * @param {ol.geom.LineString} line
 * @return {string}
 */
export const formatLength = (line, map) => {
  let length = 0;
  // Default measure
  // length = Math.round(line.getLength() * 100) / 100;
  // Geodesic measure
  const coordinates = line.getCoordinates();
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
  return output;
};
