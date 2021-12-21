import objectToQueryString from '@gostgroup/gp-utils/lib/objectToQueryString';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';

const cleanObject = object => Object.keys(object).reduce((result, key) => {
  if (!isEmpty(object[key])) {
    result[key] = object[key];
  }
  return result;
}, {});

// TODO сделать через get запрос и сохранение файла
/**
 * Экспортирует справочник
 * @param  {[type]} element
 * @param  {string} element.absolutPath
 * @param  {string} type    export type
 * @param  {Object} exportParams  exportParams
 * @param  {string} exportParams.date дата
 * @param  {string} exportParams.parentColumn
 * @param  {boolean} exportParams.showDeleted показать удаленные записи
 * @param  {Object} exportParams.filter
 * @param  {Object} exportParams.order
 */
export function exportElement(element, type, exportParams) {
  const params = cleanObject(exportParams);
  const query = objectToQueryString(params);
  window.location = `/rest/${type}/${element.absolutPath}?${query}`;
}

export const TEMPLATE_EXPORT_TYPE = 'export';
export function exportElementByTemplate(element, templateId, exportParams) {
  exportElement(element, TEMPLATE_EXPORT_TYPE, { ...exportParams, id: templateId });
}
