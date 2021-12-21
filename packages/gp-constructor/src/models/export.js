import Immutable from 'immutable';
import uuid from 'node-uuid';
import { createNewObjectFactory } from './common.js';

const factory = createNewObjectFactory('Новый шаблон');

export function createNewType(existingList = new Immutable.List()) {
  const template = factory(existingList);
  const extra = Immutable.fromJS({
    uuid: uuid.v4(),
    isDeletable: existingList.size !== 0,
  });
  return template.merge(extra);
}

export function cloneType(template, existingList) {
  const newTemplate = factory(existingList);

  const extra = Immutable.fromJS({
    uuid: uuid.v4(),
    isDeletable: true,
  });

  return newTemplate.merge(extra);
}

export function  convertExport(schema,exportTemplates) {
    let dependency = createNewType(exportTemplates);
    uuidsByKey[schema.id] = dependency.get('uuid');
    dependency = dependency.setIn(['title', 'value'], schema.title.value);
    dependency = dependency.set('idTouched', true);
    dependency = dependency.set('isDeletable', isDeletable);
    dependency = dependency.set('isMutable', isMutable);
    dependency = dependency.set('isInlineEditable', schema.isInlineEditable);
    dependency = dependency.set('type', schema.type);
    dependency = dependency.set('rules', Immutable.fromJS(schema.rules));
    return dependency;
  }
