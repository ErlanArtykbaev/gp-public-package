import { ItemsService } from '@gostgroup/gp-api-services/lib/services';
import extractVersionObject from '@gostgroup/gp-nsi-utils/lib/extractVersionObject';
import keyBy from 'lodash/keyBy';
import get from 'lodash/get';

const makeFeatureId = (...args) => args.map(i => i.id).join('-');

const extractClassifierProperties = (element) => {
  const classifierPropertyId = element.schema.config.properties.find(p => p.type === 'classifier').id;

  return item => get(item, ['version', 'object', classifierPropertyId, 'data']);
};

const assembleObject = (group, type, item) => {
  const version = extractVersionObject(item);
  return {
    group,
    typeKey: makeFeatureId(group, type),
    id: item.id,
    featureId: makeFeatureId(group, type, item),
    url: item.absolutPath,
    geocoordinates: version.geocoordinates,
    geometry: get(version, ['geocoordinates', 'features', 0, 'geometry']),
    title: item.title,
    properties: {
      nsiFormProperties: {
        // FIXME костыль - знаем название свойства которое используем
        schema: type.shema_klassifikatora,
        data: extractClassifierProperties(group.element)(item),
      },
    },
  };
};

const assembleObjects = (objects, group, type) => objects.map(obj => assembleObject(group, type, obj));

const getLayer = (path, group, type) =>
  // FIXME захардкожено имя свойства обозначающее тип
  ItemsService.path(path).get({ filter: { object: { 'tip_obekta.id': type.id } } })
    .then((itemsServiceResponse) => {
      const items = itemsServiceResponse.items.filter(t => get(t, 'version.object.tip_obekta.id') === type.id);
      const objects = assembleObjects(items, group, type);
      const geoObjects = objects.filter(o => o.geometry);
      const result = keyBy(geoObjects, 'featureId');

      return {
        group,
        type,
        features: result,
      };
    });

export default getLayer;
