import { NOTIFY, NOTIFY_COMPLEX } from '../sideeffects/notifications';

// TODO убрать использование global
export default () => next => (action) => {
  const { type, payload = {} } = action;
  if (type === NOTIFY) {
    const { title, message, level } = payload;
    global.NOTIFICATION_SYSTEM.notify(title, message, level);
  }
  if (type === NOTIFY_COMPLEX) {
    global.NOTIFICATION_SYSTEM.complexNotification(payload);
  }
  next(action);
};
