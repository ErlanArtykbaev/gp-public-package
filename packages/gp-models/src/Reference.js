import { PropTypes } from 'react';
import get from 'lodash/get';
import has from 'lodash/has';

export default class Reference {
  static shape = PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  })

  static isReference(foo) {
    return typeof foo === 'object' && foo !== null && has(foo, 'id') && has(foo, 'title');
  }

  constructor(object = {}) {
    this.id = object.id;
    this.title = object.title;
    Object.keys(object).forEach(key => (this[key] = object[key]));
    return this;
  }

  get(key) {
    return get(this, key);
  }
}
