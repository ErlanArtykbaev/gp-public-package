import get from 'lodash/get';

export default (objectOrType) => {
  const type = get(objectOrType, 'type', objectOrType);

  return type === 'group' ? 'group' : 'element';
};
