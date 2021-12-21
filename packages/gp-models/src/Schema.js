import { PropTypes } from 'react';
import get from 'lodash/get';
import set from 'lodash/set';

class Type {
  constructor(object = {}) {
    Object.keys(object).forEach(key => (this[key] = object[key]));
    return this;
  }

  getProperties() {
    return this.config.properties;
  }

  setIn(key, path, value) {
    const propertyIndex = this.config.properties.findIndex(p => p.id === key);
    set(this, `config.properties[${propertyIndex}].${path}`, value);
  }
}

export default class Schema {
  static shape = PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  })

  constructor(object = {}) {
    Object.keys(object).forEach((key) => {
      if (key === 'types') {
        this[key] = (object[key] || []).map(type => new Type(type));
      } else {
        this[key] = object[key];
      }
    });
    return this;
  }

  get(key) {
    return get(this, key);
  }

  getTypes() {
    return this.types;
  }

  getType(id) {
    return this.types.find(type => type.id === id);
  }

  getProperties() {
    return this.config.properties;
  }
}
