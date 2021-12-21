import Immutable from 'immutable';
import uuid from 'node-uuid';
import { TYPES } from './types';
// import conditions from './conditions';

export default function createSimpleRule(term, parent = null) {
  return Immutable.fromJS({
    uuid: uuid.v4(),
    type: TYPES.SIMPLE,
    term,
    value: {
      field: null,
      value: '',
      condition: null, // conditions[term].defaultValue,
      reference: null,
      type: 'value',
    },
    parent,
  });
}
