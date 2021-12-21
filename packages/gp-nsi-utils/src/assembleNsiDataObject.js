import get from 'lodash/get';
import extractProperties from './extractProperties';

/**
  * Создает каркас объекта с данными схемы, созданной с помощью createSimpleSchema
  * @example
  * const a = { properties: [ { some: { type: 'string' } } ] };
  * const b = assembleNsiDataObject(a);
  * console.log(b); // { some: null }
  * recursive (ex. a.properties[0].properties...)
  */
export default function assembleNsiDataObject(schemaFragment, object = {}) {
  const properties = extractProperties(schemaFragment);
  if (properties) {
    properties.forEach((prop) => {
      const innerProperties = extractProperties(prop);
      if (innerProperties) {
        object[prop.id] = prop.type === 'table' ? [] : {};
        assembleNsiDataObject(prop, object[prop.id]);
      } else {
        const defaultValue = get(prop, 'config.defaultValue');
        object[prop.id] = defaultValue || null;
      }
    });
  }
  return object;
}
