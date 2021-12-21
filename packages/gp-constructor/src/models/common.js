import Immutable from 'immutable';
import uuid from 'node-uuid';
import nameToId from '../utils/nameToId.js';

export function createNewObjectFactory(defaultName) {
  const regex = new RegExp(`^${nameToId(defaultName)}_(\\d+)$`);

  return (existingList = new Immutable.List()) => {
    let max = -1;

    existingList.forEach((obj) => {
      const id = obj.getIn(['id', 'value']);

      if (id === nameToId(defaultName)) {
        max = 0;
        return;
      }

      const m = regex.exec(id);


      if (m && m[1]) {
        max = Math.max(max, parseInt(m[1], 10));
      }
    });

    let name = defaultName;

    if (max > -1) {
      name += ` ${max + 1}`;
    }

    return Immutable.fromJS({
      uuid: uuid.v4(),
      id: {
        value: nameToId(name),
        error: null,
      },
      title: {
        value: name,
        error: null,
      },
      idTouched: false,
      isDeletable: true,
      isMutable: true,
    });
  };
}

function validateObjectId(id) {
  if (id.length === 0) {
    return 'Идентификатор не может быть пустым';
  }

  if (!/^[a-z0-9_]*$/.exec(id)) {
    return `
      Идентификатор может содержать только строчные латиниские буквы,
      цифры и знак _
    `;
  }

  if (!/^[a-z]/.exec(id)) {
    return 'Идентификатор должен начинаться со строчной латиниской буквы';
  }

  // let ids = getData().getIn(['typeList', 'types']).map();


  return null;
}

function validateObjectName(name) {
  if (name.length === 0 || name.trim().length === 0) {
    return 'Имя не может быть пустым';
  }

  return null;
}

export function updateObjectId(object, id, dontTouch) {
  let newObject = object;

  if (!dontTouch) {
    newObject = newObject.set('idTouched', true);
  }

  newObject = newObject.setIn(['id', 'value'], id);
  newObject = newObject.setIn(['id', 'error'], validateObjectId(id));

  return newObject;
}

export function updateObjectName(object, name) {
  const idTouched = object.get('idTouched');
  let newObject = object.setIn(['title', 'value'], name);

  newObject = newObject.setIn(['title', 'error'], validateObjectName(name));

  if (!idTouched) {
    newObject = updateObjectId(newObject, nameToId(name), true);
  }

  return newObject;
}
