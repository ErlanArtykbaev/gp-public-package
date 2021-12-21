import moment from 'moment';

export function validateUniqueKey(key, tree) {
  let error = null;
  function validateUniqueInNode(node) {
    if (node.children) {
      const length = node.children.filter(child => child.key === key).length;
      if (length > 0) {
        error = 'Ключ должен быть уникальным';
      }
      node.children.forEach((child) => {
        validateUniqueInNode(child);
      });
    }
  }
  if (tree[0]) {
    validateUniqueInNode(tree[0]);
  }

  return error;
}

export function validateKey(key, tree) {
  let validationError = null;

  if (key.length === 0) {
    return 'Ключ не может быть пустым';
  }

  if (key.length > 255) {
    return 'Длина ключа не должна превышать 255 символов';
  }

  if (!/^[a-z0-9_]*$/.exec(key)) {
    return 'Ключ может содержать только строчные латиниские буквы, цифры и знак _';
  }

  if (!/^[a-z]/.exec(key)) {
    return 'Ключ должен начинаться со строчной латинской буквы';
  }

  if (validationError === null && typeof tree !== 'undefined') {
    validationError = validateUniqueKey(key, tree);
  }

  return validationError;
}

export function validateShortTitle(shortTitle) {
  if (shortTitle.length === 0 || shortTitle.trim().length === 0) {
    return 'Краткое наименование не может быть пустым';
  }

  return null;
}

export function validateDates(dateStart, dateEnd) {
  dateStart = dateStart ? parseInt(dateStart.split('-').join(''), 10) : -Infinity;
  dateEnd = dateEnd ? parseInt(dateEnd.split('-').join(''), 10) : +Infinity;
  return dateEnd < dateStart ? 'Дата окончания не может быть меньше даты начала' : null;
}

export function validateDate(date) {
  if (!date) return null;

  let valid = date.match(/\d\d\d\d-\d\d-\d\d/);

  if (!valid) return 'Неправильный формат даты';

  valid = moment(date, 'YYYY-MM-DD').isValid();

  if (!valid) return 'Неправильная дата';

  return null;
}
