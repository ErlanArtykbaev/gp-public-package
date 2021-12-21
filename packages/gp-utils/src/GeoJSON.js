import get from 'lodash/get';

const EMPTY_POINT = ['', ''];
const EMPTY_LINESTRING = [[...EMPTY_POINT], [...EMPTY_POINT]];
const EMPTY_POLYGON = [[[...EMPTY_POINT], [...EMPTY_POINT], [...EMPTY_POINT], [...EMPTY_POINT]]];
const EMPTY_MULTILINESTRING = [[...EMPTY_LINESTRING]];
const EMPTY_MULTIPOINT = [[...EMPTY_POINT]];

const INITIAL_COORDINATES_BY_TYPE = {
  Point: EMPTY_POINT,
  LineString: EMPTY_LINESTRING,
  Polygon: EMPTY_POLYGON,
  MultiLineString: EMPTY_MULTILINESTRING,
  MultiPoint: EMPTY_MULTIPOINT,
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

  static Point(coordinates) {
    return new GeoJSONFeature({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates,
      },
      properties: {},
    });
  }

  constructor(...args) {
    if (typeof args[0] === 'object' && args[0] !== null) {
      this.type = args[0].type;
      this.geometry = args[0].geometry;
      this.properties = args[0].properties;
    } else {
      const type = args[0];
      this.type = 'Feature';
      if (typeof args[2] === 'object' && args[2] !== null) {
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

  setLatitudeOnCoordinate(value, index, arrayIndex) {
    switch (this.geometry.type) {
      case 'Point':
        this.geometry.coordinates[1] = value;
        break;
      case 'LineString':
      case 'MultiPoint':
        this.geometry.coordinates[index][1] = value;
        break;
      case 'MultiLineString':
        this.geometry.coordinates[arrayIndex][index][1] = value;
        break;
      default:
        this.geometry.coordinates[0][index][1] = value;
        if (index === 0) {
          this.geometry.coordinates[0][this.geometry.coordinates[0].length - 1][1] = value;
        }
    }
  }

  setLongitudeOnCoordinate(value, index, arrayIndex) {
    switch (this.geometry.type) {
      case 'Point':
        this.geometry.coordinates[0] = value;
        break;
      case 'LineString':
      case 'MultiPoint':
        this.geometry.coordinates[index][0] = value;
        break;
      case 'MultiLineString':
        this.geometry.coordinates[arrayIndex][index][0] = value;
        break;
      default:
        this.geometry.coordinates[0][index][0] = value;
        if (index === 0) {
          this.geometry.coordinates[0][this.geometry.coordinates[0].length - 1][0] = value;
        }
    }
  }

  addEmptyPoint(arrayIndex) {
    switch (this.geometry.type) {
      case 'LineString':
      case 'MultiPoint':
        return this.geometry.coordinates.push(EMPTY_POINT);
      case 'MultiLineString':
        return this.geometry.coordinates[arrayIndex].push(EMPTY_POINT);
      default:
        return this.geometry.coordinates[0].push(EMPTY_POINT);
    }
  }

  addEmptyArray() {
    switch (this.geometry.type) {
      case 'MultiLineString':
        this.geometry.coordinates.push(EMPTY_LINESTRING);
        break;
      default: break;
    }
  }

  deletePoint(index, arrayIndex) {
    switch (this.geometry.type) {
      case 'LineString':
      case 'MultiPoint':
        return this.geometry.coordinates.splice(index, 1);
      case 'MultiLineString':
        return this.geometry.coordinates[arrayIndex].splice(index, 1);
      default:
        return this.geometry.coordinates[0].splice(index, 1);
    }
  }

  deleteArray(arrayIndex) {
    return this.geometry.coordinates.splice(arrayIndex, 1);
  }

  getCoordinates() {
    return this.geometry.coordinates;
  }

}

export class GeoJSONFeatureCollection {

  static isValid(data) {
    return data && data.constructor && data.constructor.name === 'GeoJSONFeatureCollection';
  }

  /**
   * @param (GeoJSONFeatureCollection|Array<GeoJSONFeature>)
   */
  constructor(...args) {
    this.type = 'FeatureCollection';
    if (Array.isArray(args[0])) {
      this.features = args[0];
    } else if (typeof args[0] === 'object' && args[0] !== null) {
      this.features = args[0].features.map(f => new GeoJSONFeature(f));
    } else {
      this.features = [];
    }
  }

  getFeatures() {
    return this.features;
  }

  addFeature() {
    this.features.push(new GeoJSONFeature());
    return this;
  }

  deleteFeature(index) {
    this.features.splice(index, 1);
  }

  setFeature(index, feature) {
    this.features[index] = feature;
    return this;
  }

  getFeature(index) {
    return this.features[index];
  }

}

export function parseFeatureCollection(collection) {
  if (!collection || !Array.isArray(collection.features)) {
    return collection;
  }

  if (collection.features.length === 0) {
    return collection;
  }

  const features = collection.features.map(f => !f.geometry ? f : new GeoJSONFeature({
    ...f,
    geometry: {
      ...f.geometry,
      coordinates: get(f.geometry, ['coordinates'], [])
        .map(coord => typeof coord === 'string' ? coord.replace(',', '.') : coord),
    },
  }));

  return new GeoJSONFeatureCollection({
    features,
  });
}
