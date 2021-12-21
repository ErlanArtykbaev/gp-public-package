export const NOTIFY = 'gp-core/lib/sideeffects/notifications/notify';
export const NOTIFY_COMPLEX = 'gp-core/lib/sideeffects/notifications/notifyComplex';

export function notifyError(message) {
  return {
    type: NOTIFY,
    payload: {
      title: 'Ошибка',
      message,
      level: 'error',
    },
  };
}

export function notifyInformation() {}
export function notifyWarning() {}

export function notify(title, message, level) {
  return {
    type: NOTIFY,
    payload: { title, message, level },
  };
}

export function complexNotification(config) {
  return {
    type: NOTIFY_COMPLEX,
    payload: config,
  };
}

export function notifyServerError() {}

export function notifyUnknownError() {
  return {
    type: NOTIFY,
    payload: {
      title: 'Ошибка',
      message: 'Произошла неизвестная ошибка.',
      level: 'error',
    },
  };
}
