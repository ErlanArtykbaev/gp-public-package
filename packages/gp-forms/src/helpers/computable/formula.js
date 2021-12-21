import * as mappingRu from './excel-ru-en';

const context = require('formulajs');

export function addLocale(mapping) {
  Object.keys(mapping).forEach((key) => {
    const value = mapping[key];
    if (typeof context[value] === 'function' && typeof context[key] === 'undefined') {
      context[key] = context[value];
    }
  });
}

const addContext = formula =>
  Object.keys(context)
    .filter(k => formula.indexOf(`${k}(`) > -1)
    .reduce((p, c) =>
      p.replace(new RegExp(`${c}\\(`, 'g'), `context.${c}(`)
    , formula);

const createFunction = functionsContext => (formula) => {
  const evalExpression = `return ${addContext(formula)};`;
  return (data, ref) => (new Function('data', 'ref', 'context', evalExpression))(data, ref, functionsContext); // eslint-disable-line no-new-func
};

addLocale(mappingRu);

export default createFunction(context);
