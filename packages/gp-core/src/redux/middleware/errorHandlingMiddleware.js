/**
 * @module errorHandlingMiddleware
 * Цепляет sideeffects-экшны в случае возникновения ошибок и делает с ними различные манипуляции
 */

import { UNKNOWN_ERROR } from '../sideeffects/errors';
import { notifyUnknownError } from '../sideeffects/notifications';
import { closeSysInfoSocket } from '../modules/sysInfo';
import { logout } from '../modules/session';
import { finishInitialization } from '../modules/app';

export default store => next => (action) => {
  const { type, error, payload } = action;
  if (type === UNKNOWN_ERROR) {
    // const context = get(meta, context);
    // В случае возникновения неизвесной ошибки оповещаем об этом пользователя
    store.dispatch(notifyUnknownError());
  }

  if (error && payload instanceof Error) {
    const code = Number(payload.message);
    if (code === 403) {
      if (store.getState().core.session.session) {
        store.dispatch(logout({ forced: false }));
      } else {
        store.dispatch(closeSysInfoSocket());
      }
      store.dispatch(finishInitialization());
    }
    if (code === 404) {
      console.log(action);
      // next(action);
    }
  }
  next(action);
};
