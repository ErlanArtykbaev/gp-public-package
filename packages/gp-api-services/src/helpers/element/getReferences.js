import { ElementService } from '../../services';

export default async (referencesArray) => {
  const referencePromises = referencesArray.map(r => ElementService.path(r).get());
  const result = await Promise.all(referencePromises);
  return result;
};
