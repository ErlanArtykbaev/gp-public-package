import cloneDeep from 'lodash/cloneDeep';

const serialHasher = (...args) => JSON.stringify(args);

export default function cache(hasher = serialHasher) {
  return function cachingMethodDecorate(target, key, desc) {
    let resCache = {};
    const wrapped = desc.value;

    const cachingMethod = async function cachingMethod(...args) {
      const hash = hasher.apply(this, args);
      if (!(hash in resCache)) {
        const res = await wrapped.apply(this, args);
        resCache[hash] = res;
      } else {
        console.log('use cache');
      }
      return cloneDeep(resCache[hash]);
    };

    cachingMethod.flush = function flushMethodCache(...args) {
      delete resCache[hasher.apply(this, args)];
    };

    cachingMethod.flushAll = function flushMethodCacheAll() {
      resCache = {};
    };

    cachingMethod.flushBy = function flushMethodCacheBy(pred) {
      Object.keys(resCache).forEach((hash) => {
        if (pred(resCache[hash], hash)) {
          delete resCache[hash];
        }
      });
    };

    desc.value = cachingMethod;
    return desc;
  };
}
