import {
  ReferencesForViewService,
  ReferencesForEditService,
  RfcReferencesService,
  ElementService,
  ItemsService,
} from '../services';

/**
 * Получения данных связаного справочника при редактирование записи
 * @param {*} fullPath - путь до справочника по которому производится поиск
 * @param {*} currentPath - путь до текущего справочника
 * @param {*} startDate - Дата с
 * @param {*} endDate - Дата по
 * @param {*} term - Слово поиска
 * @param {*} entryId - Идентификатор редактируемой записи (текущего справочника)
 * @param {*} page - Номер страницы
 * @param {*} perPage - Количество записей на странице
 */
export function queryReferencesForEdit(fullPath, currentPath, startDate, endDate, term, entryId = '', page, perPage) {
  if (typeof entryId !== 'string' && typeof entryId !== 'number') {
    entryId = '';
  }
  return ReferencesForEditService.path(fullPath).get({
    referencesPath: currentPath,
    term: term || '',
    page: page || '',
    perPage: perPage || '',
    dateStart: startDate || '',
    dateEnd: endDate || '',
    entryId,
  });
}

export function queryReferencesForView(fullPath, currentPath, startDate, endDate, filterDate = '', entryId = '') {
  if (typeof entryId !== 'string' && typeof entryId !== 'number') {
    entryId = '';
  }
  return ReferencesForViewService.path(fullPath).get({
    referencesPath: currentPath,
    dateStart: startDate || '',
    dateEnd: endDate || '',
    filterDate,
    entryId,
  });
}

export function queryReferencesFull(fullPath) {
  return Promise
      .all([
        ElementService.path(fullPath).get(),
        ItemsService.path(fullPath).get(),
      ])
      .then(([element, items]) => ({
        element,
        items,
      }));
}

export function queryRFCReferences(fullPath, rfcProcessId) {
  return RfcReferencesService.path(rfcProcessId, fullPath).get();
}
