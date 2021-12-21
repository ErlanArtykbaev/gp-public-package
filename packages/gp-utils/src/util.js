import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
// TODO выпилить
import React from 'react';

export function getProcessActionNameByEntry(entry) {
  let actionName = 'Unsupported';
  if (entry.version.id) {
    actionName = `Редактирование версии справочника "${entry.element.schema.title}"`;
  } else if (entry.id) {
    actionName = `Добавление новой версии справочника "${entry.element.schema.title}"`;
  } else {
    actionName = `Новая запись справочника "${entry.element.schema.title}"`;
  }
  return actionName;
}

export const RFC_ACTIONS = {
  RECORD: ['NEW_ENTRY', 'NEW_ENTRY_VERSION', 'EDIT_ENTRY_VERSION', 'DELETE_ENTRY', 'RESTORE_ENTRY'],
  RECORD_DIFFABLE: ['NEW_ENTRY_VESION', 'EDIT_ENTRY_VERSION', 'DELETE_ENTRY'],
  ELEMENT: ['NEW_ELEMENT', 'EDIT_ELEMENT', 'DELETE_ELEMENT', 'RESTORE_ELEMENT'],
  GROUP: ['NEW_GROUP', 'EDIT_GROUP', 'DELETE_GROUP', 'RESTORE_GROUP'],
};

export const isDiffableRfcRecord = type => RFC_ACTIONS.RECORD_DIFFABLE.indexOf(type) !== -1;
export const isDiffableRfcElement = type => type === 'EDIT_ELEMENT';

const namesByType = {
  NEW_ENTRY: 'Добавление новой записи справочника',
  NEW_ENTRY_VERSION: 'Добавление новой версии записи справочника',
  EDIT_ENTRY_VERSION: 'Редактирование версии записи справочника',
  NEW_ELEMENT: 'Создание нового справочника',
  EDIT_ELEMENT: 'Редактирование справочника',
  NEW_GROUP: 'Создание новой группы',
  EDIT_GROUP: 'Редактирование группы',
  DELETE_ENTRY: 'Удаление записи справочника',
  DELETE_ELEMENT: 'Удаление справочника',
  DELETE_GROUP: 'Удаление группы',
  RESTORE_ENTRY: 'Восстановление записи',
  RESTORE_ELEMENT: 'Восстановление справочника',
  RESTORE_GROUP: 'Восстановление группы',
};
export function getProcessActionNameType(type) {
  return type in namesByType ? namesByType[type] : 'Unsupported';
}

const colorsByType = {
  NEW_ENTRY: '#aaffaa',
  NEW_ELEMENT: '#aaffaa',
  NEW_GROUP: '#aaffaa',

  EDIT_ENTRY_VERSION: '#ffffaa',
  NEW_ENTRY_VERSION: '#ffffaa',
  EDIT_ELEMENT: '#ffffaa',
  EDIT_GROUP: '#ffffaa',

  DELETE_ENTRY: '#ffaaaa',
  DELETE_ELEMENT: '#ffaaaa',
  DELETE_GROUP: '#ffaaaa',

  RESTORE_ENTRY: '#aaaaff',
  RESTORE_ELEMENT: '#aaaaff',
  RESTORE_GROUP: '#aaaaff',
};
export function getProcessActionColorType(type) {
  return colorsByType[type];
}

// deprecated
export function validateData(rules, data) {
  const errors = [];
  rules.forEach((rule) => {
    try {
      const err = eval(`(function(){ return function(data) {${rule}}})()`)(data);
      err && errors.push(err);
    } catch (err) {
      errors.push(err);
    }
  });

  return errors;
}

export function getProcessActionNameTypeWithObjectTitle(row) {
  const recMsg = msg => `${msg} "${row.entry.element.schema.title}" - ${row.entry.title}`;
  const elMsg = msg => `${msg} "${row.element.schema.title}"`;
  const groupMsg = msg => `${msg} "${row.tree.shortTitle}"`;

  switch (row.type) {
    case 'NEW_ENTRY': return recMsg('Добавление новой записи справочника');
    case 'NEW_ENTRY_VERSION': return recMsg('Добавление новой версии записи справочника');
    case 'EDIT_ENTRY_VERSION': return recMsg('Редактирование версии записи справочника');
    case 'DELETE_ENTRY': return recMsg('Удаление записи справочника');
    case 'RESTORE_ENTRY': return recMsg('Восстановление записи справочника');

    case 'NEW_ELEMENT': return elMsg('Создание нового справочника');
    case 'EDIT_ELEMENT': return elMsg('Редактирование справочника');
    case 'DELETE_ELEMENT': return elMsg('Удаление справочника');
    case 'RESTORE_ELEMENT': return elMsg('Восстановление справочника');

    case 'NEW_GROUP': return groupMsg('Создание новой группы');
    case 'EDIT_GROUP': return groupMsg('Редактирование группы');
    case 'DELETE_GROUP': return groupMsg('Удаление группы');
    case 'RESTORE_GROUP': return groupMsg('Восстановление группы');

    default: return 'unsupported';
  }
}

export function computableField(value, data) {
  let new_value = value;
  const patter_computable = /^=.*/;
  if (patter_computable.test(value)) {
    const function_text = value.replace(/^=/, '');
    try {
      new_value = eval(`(function(){ return function(data) { return ${function_text}}})()`)(data);
    } catch (e) {}
  }
  return new_value;
}

export function recursiveFilter(props, value) {
  let key;
  for (key in props) {
    const prop = props[key];
    if (typeof prop === 'object') {
      const result = recursiveFilter(prop, value);
      if (result) {
        return true;
      }
    } else if (value instanceof RegExp && value.test(prop)) {
      return true;
    } else if (value == prop) {
      return true;
    }
  }
  return false;
}

// проверка на аналичие ошибок валидации
export function hasValidationErrors(subProcess) {
  if (!isEmpty(subProcess.customValidateResult)) {
    return true;
  }
  if (!isEmpty(subProcess.validateDataResult)) {
    if (subProcess.validateDataResult.page && isEmpty(subProcess.validateDataResult.errors)) {
      return false;
    }
    return true;
  }
  return false;
}

export function getElementStatuses() {
  return {
    develop: 'В разработке',
    available: 'Доступен',
    // not_available: "Аннулирован",
    // not_available_parent: "Аннулирован родительский элемент",
  };
}

export function getStatusLabels(status, itemtype) {
  const makeEl = (ext, msg) => <span className={`aui-lozenge aui-lozenge-${ext}`}>{msg}</span>;
  switch (status) {
    case 'develop':
      return makeEl('complete', 'В разработке');
    case 'available':
      return makeEl('success', itemtype === 'group' ? 'Доступна' : 'Доступен');
    case 'not_available':
      return makeEl('error', itemtype === 'group' ? 'Аннулирована' : 'Аннулирован');
    case 'not_available_parent':
      return makeEl('error', 'Аннулирован родительский элемент');
    default:
      return makeEl('error', 'Неизвестный статус');
  }
}

export function isDisabledByParent(item) {
  return (typeof item.status !== 'undefined' && item.status !== 'not_available' && // если имеет статус, но недоступен из-за родителя
    typeof item.isAvailable !== 'undefined' && item.isAvailable === false
  ) || (
    typeof item.status === 'undefined' && // если не имеет статус и недоступен из-за родителя
    typeof item.isAvailable !== 'undefined' && item.isAvailable === false
  );
}

export function today() {
  return moment().format('YYYY-MM-DD');
}

export function formatDate(date) {
  return date ? moment(date).format(global.APP_DATETIME_FORMAT) : '';
}

export function formatDateServer(date) {
  return date ? moment(date).format('YYYY-MM-DD') : '';
}

export function formatVersion(v) {
  let result = `Версия №${v.id}:`;

  if (!v.dateStart && !v.dateEnd) {
    return `${result} действует постоянно`;
  }

  if (v.dateStart) {
    result += ` с ${formatDate(v.dateStart)}`;
  }

  if (v.dateEnd) {
    result += ` по ${formatDate(v.dateEnd)}`;
  }

  return result;
}
