import get from 'lodash/get';
import extractVersionObject from '@gostgroup/gp-nsi-utils/lib/extractVersionObject';
import execFormula from './computable/formula';

/**
 * @example
 * extractRefs('data.field + ref.field.value + ref.field2') // ['field', 'field2']
 */
const extractRefs = string => (string.match(/(ref\.(\w+))(?!.*\1)/g) || []).map(s => s.split('.')[1]);

/**
 * @example
 * const calculate = calculator({ a: 1, b: 2 }, {});
 * calculate('data.a + data.b') // 3
 */
const calculator = (data, ref) => (formula) => {
  let result;
  try {
    result = execFormula(formula)(data, ref);
    if (typeof result !== 'string' && isNaN(result)) {
      result = 'Ошибка при вычислении выражения';
    }
  } catch (e) {
    console.log(e); // eslint-disable-line no-console
  }
  if (typeof result === 'string') {
    result = result.replace(/undefined/g, '').replace(/NaN/g, '');
  }
  return result;
};

export function makeRefObject(allProperties, references, data) {
  return allProperties
    .filter(p => p.type === 'reference')
    .filter(p => typeof data[p.id] !== 'undefined')
    .reduce((result, property) => {
      result[property.id] = extractVersionObject(
        get(references, get(property, 'config.key'), []).find(obj => obj.id === data[property.id])
      );
      return result;
    }, {});
}

export default function calculateComputables(allProperties, references, data) {
  const computableProperties = allProperties.filter(prop => prop.type === 'computable');
  const ref = makeRefObject(allProperties, references, data);

  const calculateComputable = calculator(data, ref);

  const computables = computableProperties.reduce((result, property) => {
    const formula = property.config.type;

    if (formula && formula.length > 0) {
      const requestedReferences = extractRefs(formula);
      requestedReferences.forEach((r) => {
        if (typeof ref[r] === 'undefined') {
          ref[r] = {};
        }
      });
      result[property.id] = calculateComputable(formula, data);
    }

    return result;
  }, {});

  return computables;
}
