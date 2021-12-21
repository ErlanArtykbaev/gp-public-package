import map from 'lodash/map';

export default function hasValues(object, value) {
  let objectHasValues = false;

  function findValues(objectFragment) {
    map(objectFragment, (v) => {
      if (typeof v === 'object') {
        findValues(v);
      } else if (v === value) {
        objectHasValues = true;
      }
    });
  }

  findValues(object);

  return objectHasValues;
}
