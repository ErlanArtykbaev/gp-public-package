import validateAndSave from './validateAndSave';

/**
 * Создает запись
 * @param {Object} parentPath - Путь до родительского элемента
 * @param {Object} data - Данные записи
 * @return {Promise}
 */
export default (parentPath, data) => {
  const payload = {
    id: '',
    shortTitle: data.shortTitle,
    fullTitle: data.fullTitle,
    isAvailable: true,
    version: {
      id: '',
      data: data.cleanData,
    },
  };

  if (data.startDate) {
    payload.version.dateStart = data.startDate;
  }

  if (data.endDate) {
    payload.version.dateEnd = data.endDate;
  }

  return validateAndSave(parentPath, payload);
};
