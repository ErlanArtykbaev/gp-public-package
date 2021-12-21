import keyBy from 'lodash/keyBy';

import fias from './fias';
import egrul from './egrul';

const types = [
  fias,
  egrul,
];

const indexedTypes = keyBy(types, 'id');

export default types;
export {
  indexedTypes,
};
