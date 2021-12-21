import validateAndSave from './validateAndSave';

export default (fullPath, data) => {
  const segments = fullPath.split('/');
  const segmentPath = segments.slice(0, segments.length - 1);
  const path = segmentPath.join('/');

  const id = segments[segments.length - 1];

  const payload = {
    id,
    version: {
      id: '',
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

  // TODO добавить проверку
  // const errors = await this.postJSON(`/item/${path}`, payload, true);
  //
  // if (errors && errors.exception === 'com.gost_group.nsi.bpmn.validation.ValidationError') {
  //   global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Обнаружено пересечение дат', 'error');
  // }
  //
  // return this.getRecord(fullPath);
};
