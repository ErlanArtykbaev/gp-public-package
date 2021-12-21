const getIndex = (array, indexOrFunction) => {
  if (typeof indexOrFunction === 'function') {
    return array.findIndex(indexOrFunction);
  }
  return indexOrFunction;
};

export const remove = (array: any[], indexOrFunction) => {
  const index = getIndex(array, indexOrFunction);
  if (index === -1) {
    return [...array];
  }
  return [
    ...array.slice(0, index),
    ...array.slice(index + 1),
  ];
};

export const insert = (array: any[], index, item) => {
  return [
    ...array.slice(0, index),
    item,
    ...array.slice(index),
  ];
};

export const set = (array: any[], indexOrFunction, item) => {
  const index = getIndex(array, indexOrFunction);
  if (index === -1 || index >= array.length) {
    throw new Error('Index is missing');
  }
  return [
    ...array.slice(0, index),
    item,
    ...array.slice(index + 1),
  ];
};

export const update = (array: any[], indexOrFunction, updater) => {
  const index = getIndex(array, indexOrFunction);
  if (index === -1 || index >= array.length) {
    throw new Error('Index is missing');
  }
  return [
    ...array.slice(0, index),
    updater(array[index]),
    ...array.slice(index + 1),
  ];
};

export const upsert = (array: any[], indexOrFunction, item) => {
  const index = getIndex(array, indexOrFunction);
  if (index === -1 || index >= array.length) {
    return [
      ...array,
      item,
    ];
  }
  return set(array, index, item);
};
