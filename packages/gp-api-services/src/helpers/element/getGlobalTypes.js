import {
  GlobalTypeService,
  GlobalTypeTitlesService,
} from '../../services';

export default async () => {
  const typeTitles = await GlobalTypeTitlesService.get();
  const promises = typeTitles.map(({ key }) => GlobalTypeService.path(key).get());

  return Promise.all(promises);
};
