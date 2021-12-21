import get from 'lodash/get';
import { isEmpty } from 'lodash';
import { RecordService, ValidateRecordService } from '../../services';

export default (path, payload) => (
  ValidateRecordService.path(path).post(payload)
    .then((validationRes) => {
      if (validationRes.valid != true || !isEmpty(validationRes.validationError)) {
        throw new Error(validationRes.validationError);
      }
    }, (err) => {
      if (err.message === '405') return; // проглотить 405 для обратной совместимости
      throw new Error('ошибка валидации'); // нормализация сообщений об ошибке
    })
    .then(() => (
      RecordService.path(path).post(payload).catch(() => {
        throw new Error('ошибка при сохранении'); // нормализация сообщений об ошибке
      })
    ))
    .catch((err) => {
      global.NOTIFICATION_SYSTEM.notify('Ошибка', get(err, 'message', err), 'error');
      throw err;
    })
);
