import Immutable from 'immutable';
import createSimpleRule from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/createSimpleRule';
import { wrapWith } from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/applyOperator';
import { TYPES } from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/types';
import { createNewObjectFactory } from './common.js';

const factory = createNewObjectFactory('Новая зависимость');

export function createNewDependency(existingList = new Immutable.List()) {
  const dependency = factory(existingList);
  const extra = Immutable.fromJS({
    type: 'easy',
    isDeletable: existingList.size !== 0,
  });
  return dependency
    .merge(extra)
    .set('rules', new Immutable.Map({
      if: createSimpleRule('if'),
      then: wrapWith(TYPES.AND, createSimpleRule('then')),
      else: wrapWith(TYPES.AND, createSimpleRule('else')),
      parsed: '',
    }));
}

export function cloneDependency(dependency, existingList) {
  const newDependency = factory(existingList);
  const rules = dependency.get('rules');

  const extra = Immutable.fromJS({
    rules,
    type: 'easy',
    isDeletable: true,
  });

  return newDependency.merge(extra);
}
