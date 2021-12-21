export function mixin(behaviour, sharedBehaviour = {}) {
  let instanceKeys,
    sharedKeys;
  const typeTag = Symbol('isa');

  if (window.Reflect) {
    instanceKeys = Reflect.ownKeys(behaviour);
    sharedKeys = Reflect.ownKeys(sharedBehaviour);
  } else {
    instanceKeys = [];
    sharedKeys = [];

    for (const key in behaviour) {
      if (behaviour.hasOwnProperty(key)) {
        instanceKeys.push(key);
      }
    }

    for (key in sharedBehaviour) {
      if (sharedBehaviour.hasOwnProperty(key)) {
        sharedKeys.push(key);
      }
    }
  }

  function _mixin(clazz) {
    for (const property of instanceKeys) {
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour[property],
        writable: true,
      });
    }
    Object.defineProperty(clazz.prototype, typeTag, { value: true });
    return clazz;
  }
  for (const property of sharedKeys) {
    Object.defineProperty(_mixin, property, {
      value: sharedBehaviour[property],
      enumerable: sharedBehaviour.propertyIsEnumerable(property),
    });
  }
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: i => !!i[typeTag],
  });
  return _mixin;
}
