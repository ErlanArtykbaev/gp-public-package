import { ItemsService, ElementService } from '@gostgroup/gp-api-services/lib/services';
import { loadIcon } from '../../utils/openlayers/olIcons';
import makeFileUrl from '@gostgroup/gp-nsi-utils/lib/makeFileUrl';

export default path => Promise.all([
  ElementService.path(path.items).get(),
  ItemsService.path(path.types).get(),
]).then(([elementServiceResponse, itemsServiceResponse]) => {
  const { items } = itemsServiceResponse;
  const layers = items.filter(i => i.version.object.icon).map(i => ({
    id: i.id,
    url: i.absolutPath,
    ...i.version.object,
  }));

  // TODO костыль убрать
  layers.forEach(l => loadIcon(`1-${l.id}`, makeFileUrl(l.icon)));

  return [{
    key: 'static',
    title: 'Статические объекты',
    innerGroups: [{
      url: path.items,
      // TODO костыль убрать
      id: 1,
      element: elementServiceResponse,
      title: 'Все объекты',
      layers,
    }],
  }];
});
