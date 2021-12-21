import React from 'react';
import { render } from 'react-dom';
import NotificationSystem from 'react-notification-system';

const notificationsDiv = document.createElement('div');
notificationsDiv.id = 'notifications';
document.body.appendChild(notificationsDiv);
let baseID = 0;

const defaultOptions = {
  level: 'warning',
  autoDismiss: 5,
  position: 'tr',
};

/*
  INFO
  https://github.com/igorprado/react-notification-system
 */
class AppNotificationSystem extends NotificationSystem {

  constructor(props) {
    super(props);
    this._notify = this.notify.bind(this);
  }

  _addNotification(notification) {
    this._notificationSystem.addNotification(notification);
  }

  /**
   * показать обычное сообщение
   * @param text
   * @param type success|error|warning|info
   */
  notify(title, message, level) {
    if (typeof this._notificationSystem === 'undefined') {
      return;
    }

    this._notificationSystem.addNotification({
      title,
      message,
      level,
      position: 'tr',
    });
  }

  complexNotification(options, safe) {
    if (safe) {
      if (this._notificationSystem.getNotificationRef('server-off')) {
        return;
      }
    }
    this._notificationSystem.addNotification({
      ...defaultOptions,
      ...options,
    });
  }

  addRemovableNotification(options, onRemove = () => {}, uid = baseID += 1) {
    const optionsObject = {
      level: 'error',
      position: 'tr',
      autoDismiss: 0,
      dismissible: true,
      ...options,
      onRemove: (...args) => { onRemove(args); this.remove(uid); },
      uid,
    };
    if (options.removeAction) {
      optionsObject.action = {
        ...options.removeAction,
        callback: () => {
          this.remove(uid);
        },
      };
    }
    this._notificationSystem.addNotification(optionsObject);
  }

  remove(uid) {
    this._notificationSystem.removeNotification(uid);
  }

  render() {
    return (
      <NotificationSystem ref={node => (this._notificationSystem = node)} />
    );
  }
}

global.NOTIFICATION_SYSTEM = render(<AppNotificationSystem />, document.getElementById('notifications'));
