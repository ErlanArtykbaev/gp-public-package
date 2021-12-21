export function create(data, id = '', versionId = 1) {
  const payload = {
    id,
    shortTitle: data.shortTitle,
    fullTitle: data.fullTitle,
    isAvailable: true,
    version: {
      id: versionId,
      data: data.cleanData || data,
    },
  };

  if (data.startDate) {
    payload.version.dateStart = data.startDate;
  }

  if (data.endDate) {
    payload.version.dateEnd = data.endDate;
  }

  return payload;
}
