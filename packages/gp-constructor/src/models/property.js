import Immutable from 'immutable';
import { createNewObjectFactory } from './common.js';

const factory = createNewObjectFactory('Новое свойство');

export function createNewProperty(existingPropertiesList, isTypeMutable) {
  const property = factory(existingPropertiesList);

  const extra = Immutable.fromJS({
    collapsed: false,
    type: 'string',
    required: false,
    unique: false,
    useStyles: false,
    editableByAdminOnly: false,
    typeConfig: {},
    isRequireChangable: isTypeMutable,
    isUniqueChangeable: isTypeMutable,
  });

  return property.merge(extra);
}

export function cloneProperty(property, existingPropertiesList) {
  const newProperty = factory(existingPropertiesList);

  const extra = Immutable.fromJS({
    collapsed: false,
    type: property.get('type'),
    required: property.get('required'),
    typeConfig: property.get('typeConfig'),
  });

  return newProperty.merge(extra);
}

export function getTitleProp() {
  let prop = createNewProperty(new Immutable.List());
  prop = prop.setIn(['id', 'value'], 'title');
  prop = prop.setIn(['title', 'value'], 'Наименование');
  prop = prop.set('idTouched', true);
  prop = prop.set('required', true);
  prop = prop.set('isDeletable', false);
  prop = prop.set('isMutable', false);
  prop = prop.set('collapsed', true);
  prop = prop.set('isRequireChangable', false);
  prop = prop.set('isUniqueChangeable', false);
  return prop;
}
