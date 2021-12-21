import get from 'lodash/get';
import {
  ElementService,
  ItemsService,
} from '../../services';

function fetchData(fullPath, date) {
  return Promise
    .all([
      ElementService.path(fullPath).get(),
      ItemsService.path(fullPath).get({ date }),
    ])
    .then(([element, versions]) => ({ element, versions }));
}

export default async (element, date) => {
  // console.info('HELPERS getReferenceData');
  const reference_data = {};
  const properties = get(element, 'schema.config.properties', []);
  const parentReferences = properties.filter(prop => prop.type === 'reference' && prop.config.key !== element.absolutPath);
  const promises = parentReferences.reduce((result, reference) => {
    result.push(fetchData(reference.config.key, date).then((response) => {
      reference_data[reference.id] = response;
    }));
    return result;
  }, []);
  await Promise.all(promises);
  return reference_data;
};
