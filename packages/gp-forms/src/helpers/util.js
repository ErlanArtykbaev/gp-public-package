import moment from 'moment';
import get from 'lodash/get';

export function formatDate(date) {
  if (!date) return '';
  return moment(date).format(global.APP_DATE_FORMAT);
}

export function filterReference(reference, data, filterExpression) {
  const evalExpression = `
          (function() {
            return function(ref, data) {
                return ${filterExpression}
            }
          })()`;

  function filterFn(ref) {
    let result = ref;
    try {
      result = eval(evalExpression)(ref, data); // eslint-disable-line
    } catch (e) {
      console.log(e); // eslint-disable-line
    }
    return result;
  }

  return reference.filter(filterFn);
}

export function applyFilterToReference(reference, data, filterExpression) {
  return filterExpression
    ? filterReference(reference, data, filterExpression)
    : reference;
}

export function getFullTitleFromTypeConfig(typeConfig) {
  const unitTitle = get(typeConfig, ['config', 'unit', 'title']);

  return unitTitle
    ? `${typeConfig.title}, ${unitTitle.toLowerCase()}`
    : typeConfig.title;
}
