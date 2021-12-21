import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import { TYPES } from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/types';
import toJSCondition from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/toJSCondition';
import conditions from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/conditions';
import assembleNsiDataWithReferences from '@gostgroup/gp-nsi-utils/lib/assembleNsiDataWithReferences';
import createSimpleSchema from '@gostgroup/gp-nsi-utils/lib/createSimpleSchema';


export function checkRuleGroup(type, ruleGroup, schema, data, references) {
  const condition = toJSCondition(type)(ruleGroup);
  const assembledData = assembleNsiDataWithReferences(references)(createSimpleSchema(schema), cloneDeep(data));
  // console.log(condition, assembledData);
  const check = new Function('data', 'context', `return ${condition}`); // eslint-disable-line no-new-func

  try {
    const result = check(assembledData, conditions.validators[type]);
    return result;
  } catch (e) {
    // console.log(e);
    return false;
  }
}

/**
 * Обрабатывает и изменяет схему и данные в соответствии с зависимостями
 * @param
 * @return (Object) assembledSchemaAndData - объект с измененной схемой и данными
 * @return (Object) assembledSchemaAndData.schema - измененная схема
 * @return (Object) assembledSchemaAndData.data - измененные данные
 */
function processAndAssemble(type, rules, schema, data) {
  let result = {
    schema,
    data,
  };
  rules.forEach((rule) => {
    const condition = conditions[type].base.find(c => c.id === rule.value.condition);
    // console.log(rule.value, result.data);
    if (typeof condition.resolver === 'function') {
      result = condition.resolver(rule.value.field, result.schema, result.data, rule.value.value, rule.value);
    }
    if (typeof condition.message === 'function') {
      // console.log(condition.message(rule.value.field, rule.value.value));
    }
  });

  return result;
}

const dependencyAffected = (dep, oldData, newData) => {
  if (!dep) return false;
  if (dep.type === TYPES.SIMPLE) {
    const field = dep.value.field;
    if (dep.value.reference) {
      const path = field.split('.');
      const prefix = [];
      // возможно, идем по составным полям
      for (const segment of path) {
        prefix.push(segment);
        const oldValue = get(oldData, prefix);
        const newValue = get(newData, prefix);
        // если дошли до id ссылки
        if (!(oldValue instanceof Object) && !(newValue instanceof Object)) {
          return oldValue !== newValue;
        }
        // если объект не изменился, то и поле внутри него не изменилось
        if (isEqual(oldValue, newValue)) {
          return false;
        }
        // в объекте могла измениться совсем не ссылка, идем дальше.
      }
    }
    return !isEqual(get(oldData, field), get(newData, field));
  }
  for (const child of dep.children) {
    if (dependencyAffected(child, oldData, newData)) {
      return true;
    }
  }
  return false;
};

export function needRecompute(schema, oldData, newData) {
  const { dependencies } = schema;
  const res = dependencies &&
    !isEqual(oldData, newData) &&
    dependencies.some(d => dependencyAffected(d.rules.if, oldData, newData));
  return res;
}

export default function processDependencies(dependencies = [], schema, data, references) {
  let result = { schema: cloneDeep(schema), data: cloneDeep(data) };
  dependencies.forEach((dependency) => {
    const { rules } = dependency;
    const passed = checkRuleGroup('if', rules.if, schema, result.data, references);
    if (passed) {
      result = processAndAssemble('then', rules.then.children, result.schema, result.data);
      // console.log(passed, result);
    }
  });

  return result;
}
