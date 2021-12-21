import validateAndSave from './validateAndSave';

export default (fullPath, data) => {
  const segments = fullPath.split('/');
  const path = fullPath.split('/').slice(0, -1).join('/');

  const id = segments[segments.length - 1];

  const payload = {
    id,
    version: {
      id: data.version.id,
      data: data.cleanData,
    },
  };

  if (data.startDate) {
    payload.version.dateStart = data.startDate;
  }

  if (data.endDate) {
    payload.version.dateEnd = data.endDate;
  }

  return validateAndSave(path, payload);
};
