import { get } from 'lodash';
import { HealthService, SessionService } from '@gostgroup/gp-api-services/lib/services';
import { makeLogout, logout } from 'gp-core/lib/redux/modules/session';
import { startInitialization } from 'gp-core/lib/redux/modules/app';
import { complexNotification } from 'gp-core/lib/redux/sideeffects/notifications';
import { ServerStatusManager } from './ServerStatusManager';

const serverStatusManager = new ServerStatusManager();
const sessionStatusManager = new ServerStatusManager();

export default store => next => (action) => {
  serverStatusManager.setService(HealthService.get);
  serverStatusManager.on('off', () => {
    store.dispatch(complexNotification({
      title: 'Внимание',
      message: 'Технические неполадки на стороне сервера',
      position: 'tc',
      action: {
        label: 'Обновить страницу',
        callback: () => window.location.reload(),
      },
      uid: 'server-off',
      autoDismiss: 120,
      dismissible: true,
    }, true));
  });

  sessionStatusManager.setService(SessionService.get);
  sessionStatusManager.on('brokenSession', () => {
    if (get(store.getState(), 'core.session.session', null) !== null) {
      global.NOTIFICATION_SYSTEM.addRemovableNotification({
        title: 'Внимание',
        message: 'Сессия прервана по неопределённым причинам, связанным с работоспособностью сервера.',
        level: 'warning',
        autoDismiss: 0,
      });
      store.dispatch(logout());
    }
  });

  if (action.type === String(startInitialization)) {
    serverStatusManager.startTracking();
    sessionStatusManager.startTracking();
  }
  if (action.type === String(makeLogout)) {
    serverStatusManager.endTracking();
    sessionStatusManager.endTracking();
  }

  next(action);
};
