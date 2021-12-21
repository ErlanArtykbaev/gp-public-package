const EMPTY_POINT = ['', ''];
const EMPTY_LINESTRING = [[...EMPTY_POINT], [...EMPTY_POINT]];
const EMPTY_POLYGON = [[[...EMPTY_POINT], [...EMPTY_POINT], [...EMPTY_POINT], [...EMPTY_POINT]]];

const INITIAL_COORDINATES_BY_TYPE = {
  Point: EMPTY_POINT,
  LineString: EMPTY_LINESTRING,
  Polygon: EMPTY_POLYGON,
};

export function createGeoJSONFeatureGeometry(type, coordinates) {
  if (!type || !coordinates) {
    return {};
  }
  return {
    type,
    coordinates,
  };
}

export class GeoJSONFeature {

  static isValid(data) {
    return data && data.constructor && data.constructor.name === 'GeoJSONFeature';
  }

  constructor(...args) {
    if (typeof args[0] === 'object') {
      this.type = args[0].type;
      this.geometry = args[0].geometry;
      this.properties = args[0].properties;
    } else {
      const type = args[0];
      this.type = 'Feature';
      if (typeof args[2] === 'object') {
        this.properties = args[2];
      } else {
        this.properties = {};
      }
      if (typeof type === 'string') {
        let coordinates = [...INITIAL_COORDINATES_BY_TYPE[type]];
        if (Array.isArray(args[1])) {
          coordinates = args[1];
        }
        this.geometry = createGeoJSONFeatureGeometry(type, coordinates);
      }
    }
  }

  getGeometry() {
    return this.geometry;
  }

  getGeometryType() {
    return this.geometry.type;
  }

  setLatitudeOnCoordinate(index, value) {
    if (this.geometry.type === 'Point') {
      this.geometry.coordinates[1] = value;
    } else if (this.geometry.type === 'LineString') {
      this.geometry.coordinates[index][1] = value;
    } else {
      this.geometry.coordinates[0][index][1] = value;
      if (index === 0) {
        this.geometry.coordinates[0][this.geometry.coordinates[0].length - 1][1] = value;
      }
    }
  }

  setLongitudeOnCoordinate(index, value) {
    if (this.geometry.type === 'Point') {
      this.geometry.coordinates[0] = value;
    } else if (this.geometry.type === 'LineString') {
      this.geometry.coordinates[index][0] = value;
    } else {
      this.geometry.coordinates[0][index][0] = value;
      if (index === 0) {
        this.geometry.coordinates[0][this.geometry.coordinates[0].length - 1][0] = value;
      }
    }
  }

  addEmptyPoint() {
    if (this.geometry.type === 'LineString') {
      this.geometry.coordinates.push(EMPTY_POINT);
    } else { // Polygon
      this.geometry.coordinates[0].push(EMPTY_POINT);
    }
  }

  deletePoint(index) {
    if (this.geometry.type === 'LineString') {
      this.geometry.coordinates.splice(index, 1);
    } else {
      this.geometry.coordinates[0].splice(index, 1);
    }
  }

  getCoordinates() {
    return this.geometry.coordinates;
  }

}

export class GeoJSONFeatureCollection {

  static isValid(data) {
    return data && data.constructor && data.constructor.name === 'GeoJSONFeatureCollection';
  }

  constructor(...args) {
    this.type = 'FeatureCollection';
    if (typeof args[0] === 'object') {
      this.features = args[0].features.map(f => new GeoJSONFeature(f));
    } else if (Array.isArray(args[0])) {
      this.features = args[0];
    } else {
      this.features = [];
    }
  }

  getFeatures() {
    return this.features;
  }

  addFeature() {
    this.features.push(new GeoJSONFeature());
  }

  deleteFeature(index) {
    this.features.splice(index, 1);
  }

  setFeature(index, feature) {
    this.features[index] = feature;
  }

}
