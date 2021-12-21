import Immutable from 'immutable';
import { createNewType } from './type.js';
import { getTitleProp } from './property.js';

export function createNewSchema(clear = false) {
  let baseType = createNewType().set('properties', new Immutable.List([]));
  !clear && (baseType = baseType.update('properties', props => props.push(getTitleProp())));
  const schema = Immutable.fromJS({
    typeList: {
      selected: null,
      types: [
        Immutable.fromJS(baseType),
      ],
      dependencies: [],
      global: [
        Immutable.fromJS(baseType),
      ],
    },
    validationRules: [],
    deduplicationRules: {},
    exportTemplates: [],
  });

  return schema;
}

// TODO implement
export function cloneSchema() {
  return null;
}
