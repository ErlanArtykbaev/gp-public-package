import get from 'lodash/get';
import extractProperties from './extractProperties';
import extractVersionObject from './extractVersionObject';

/**
  * Создает каркас объекта с данными схемы, созданной с помощью createSimpleSchema
  * @example
  * const a = { properties: [ { some: { type: 'string' } } ] };
  * const b = assembleNsiDataObject(a);
  * console.log(b); // { some: null }
  * recursive (ex. a.properties[0].properties...)
  */
export default references => function assembleNsiDataWithReferences(schemaFragment, data = {}) {
  const properties = extractProperties(schemaFragment);
  if (properties) {
    properties.forEach((prop) => {
      const innerProperties = extractProperties(prop);
      if (innerProperties) {
        assembleNsiDataWithReferences(prop, data[prop.id]);
      } else {
        const key = get(prop, 'config.key');
        if (key && references[key]) {
          const referenceData = references[key].find(i => i.id === data[prop.id]);
          if (referenceData) {
            data[prop.id] = { ...extractVersionObject(referenceData), id: data[prop.id] };
          }
        }
      }
    });
  }
  return data;
};
