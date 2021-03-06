function buildParams(prefix, obj, add) {
  let name;
  let i;
  let l;
  const rbracket = /\[\]$/;
  if (obj instanceof Array) {
    for (i = 0, l = obj.length; i < l; i++) {
      if (rbracket.test(prefix)) {
        add(prefix, obj[i]);
      } else {
        buildParams(`${prefix}[${typeof obj[i] === 'object' ? i : ''}]`, obj[i], add);
      }
    }
  } else if (typeof obj === 'object') {
    // Serialize object item.
    for (name in obj) {
      buildParams(`${prefix}[${name}]`, obj[name], add);
    }
  } else {
    // Serialize scalar item.
    add(prefix, obj);
  }
}

export default (a = {}) => {
  let prefix;
  let name;
  const s = [];
  const r20 = /%20/g;
  const add = (key, value) => {
    // If value is a function, invoke it and return its value
    value = (typeof value === 'function') ? value() : (value == null ? '' : value);
    s[s.length] = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  };
  if (a instanceof Array) {
    for (name in a) {
      add(name, a[name]);
    }
  } else {
    for (prefix in a) {
      buildParams(prefix, a[prefix], add);
    }
  }
  const output = s.join('&').replace(r20, '+');
  return output;
};
