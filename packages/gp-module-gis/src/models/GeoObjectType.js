import get from 'lodash/get';

// TODO typescript
export default class GeoObjectType {
  static isValid = item => get(item, 'version.object.icon')

  static PROPERTIES_PATH = 'version.object.geo_properties.features.0.properties'
  static getStyleProperties = item => get(item, GeoObjectType.PROPERTIES_PATH, {})

  constructor(item) {
    this.id = item.id;
    this.title = item.version.object.title;
    this.iconUrl = `/rest/files/download/${item.version.object.icon.uuid}/${item.version.object.icon.name}`;
    this.version = item.version;
  }
}
