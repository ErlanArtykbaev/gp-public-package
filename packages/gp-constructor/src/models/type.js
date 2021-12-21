import Immutable from 'immutable';
import uuid from 'node-uuid';
import { createNewObjectFactory } from './common.js';

const factory = createNewObjectFactory('Новый тип');

export function createNewType(existingTypesList = new Immutable.List()) {
  const type = factory(existingTypesList);
  const extra = Immutable.fromJS({
    properties: [],
    main: existingTypesList.size === 0,
    isDeletable: existingTypesList.size !== 0,
  });
  return type.merge(extra);
}

function cloneProperty(property) {
  property = property.set('isMutable', true);
  property = property.set('uuid', uuid.v4());
  property = property.set('collapsed', false);
  return property;
}

export function cloneType(type, existingTypesList) {
  const newType = factory(existingTypesList);
  const properties = type.get('properties').map(p => cloneProperty(p));

  const extra = Immutable.fromJS({
    properties,
    main: false,
    isDeletable: true,
  });

  return newType.merge(extra);
}
