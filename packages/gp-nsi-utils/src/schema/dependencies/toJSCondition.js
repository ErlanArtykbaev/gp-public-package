import { TYPES, TYPES_OPERATORS } from './types';
import conditions from './conditions';

const validators = conditions.validators;
const formatters = conditions.formatters;

const format = (type, conditionId, value) => {
  const formatter = formatters[type][conditionId];
  return formatter ? formatter(value) : value;
};

export default type =>
  function toJSCondition(ruleGroup) {
    if (ruleGroup.type === TYPES.SIMPLE) {
      const rule = ruleGroup.value;
      if (validators[type][rule.condition]) {
        const fieldData = `data.${rule.field}`;
        return `context.safeValidator(context.${rule.condition})(${fieldData}, ${format(type, rule.condition, rule.value)})`;
      }
      return `data.${ruleGroup.value.field}${ruleGroup.value.condition}${ruleGroup.value.value}`;
    }
    const operator = TYPES_OPERATORS[ruleGroup.type];
    if (ruleGroup.type === TYPES.NOT) {
      if (ruleGroup.children && ruleGroup.children.length !== 1) {
        throw new Error('Invalid arity');
      }
      return `${operator}(${toJSCondition(ruleGroup.children[0])})`;
    }
    return `(${(ruleGroup.children || []).map(toJSCondition).join(operator)})`;
  };
