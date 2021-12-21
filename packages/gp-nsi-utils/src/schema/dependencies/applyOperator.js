import Immutable from 'immutable';
import uuid from 'node-uuid';
import { TYPES } from './types';
import createSimpleRule from './createSimpleRule';

function addBlankRule(ruleGroup) {
  return ruleGroup
    .update('children', c => c.push(createSimpleRule(ruleGroup.get('term'), ruleGroup)));
}

export function wrapWith(type, ruleGroup) {
  return Immutable.fromJS({
    uuid: uuid.v4(),
    type,
    term: ruleGroup.get('term'),
    children: [
      ruleGroup,
    ],
  });
}

const baseApplyOperator = type => (rules, path) => {
  const ruleGroup = rules.getIn(path);
  const parentPath = path.slice(0, -2);
  const parent = rules.getIn(parentPath);
  if (parent && parent.get('type') === type) {
    return rules.setIn(parentPath, addBlankRule(parent));
  }
  if (ruleGroup.get('type') === type) {
    return rules.setIn(path, addBlankRule(ruleGroup));
  }
  return rules.setIn(path, wrapWith(type, ruleGroup));
};

const typeResolvers = {
  [TYPES.AND]: baseApplyOperator(TYPES.AND),
  [TYPES.OR]: baseApplyOperator(TYPES.OR),
  [TYPES.NOT]: (rules, path) => rules.updateIn(path, ruleGroup => wrapWith(TYPES.NOT, ruleGroup)),
};

const applyOperator = (rules, type, path) => typeResolvers[type](rules, path);

export default applyOperator;
