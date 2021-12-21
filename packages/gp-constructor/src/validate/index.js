export function validateRegexp(regexp) {
  try {
    if (regexp.length > 0) {
      new RegExp(regexp); // eslint-disable-line no-new
    }
  } catch (err) {
    console.log('ERROR', err); // eslint-disable-line no-console
    return 'Регулярное выражение составлено неверно';
  }

  return null;
}

export function validateTestRegexp(test, regexp) {
  try {
    if (regexp.length > 0) {
      const r = new RegExp(regexp);
      if (r.test(test) === false) return 'Пример не соответствует регулярному выражению';
    } else {
      return 'Регулярное выражение не введено';
    }
  } catch (err) {
    console.log('ERROR', err);
    return 'Регулярное выражение составлено неверно';
  }

  return null;
}
