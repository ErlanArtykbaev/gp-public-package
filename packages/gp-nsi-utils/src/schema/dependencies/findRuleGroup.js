import Immutable from 'immutable';

const BASE_RULE_GROUPS = ['if', 'then', 'else'];

const findRuleGroup = (ruleUUID, rules) => {
  function findNodeWithPath(id, currentNode, path = []) {
    let i;
    let currentChild;
    let result;
    if (id === currentNode.get('uuid')) {
      return { ruleGroup: currentNode, path };
    }
    const arr = currentNode.get('children') || new Immutable.List();
    const length = arr.count();

    length > 0 && path.push('children');

    for (i = 0; i < length; i += 1) {
      currentChild = arr.get(i);
      result = findNodeWithPath(id, currentChild, [...path, i]);
      if (result !== false) {
        return result;
      }
    }
    return false;
  }

  const result = BASE_RULE_GROUPS.map(r => findNodeWithPath(ruleUUID, rules.get(r), [r])).find(r => !!r);
  return result;
};

export default findRuleGroup;
