import { checkRoutePermissions } from './config/permissions';

export default function getRoutes({ getSession, index }) {
  return {
    path: 'unsubscribe/*',
    onEnter: checkRoutePermissions('unsubscribe', getSession, index),
    getComponent(nextState, callback) {
      require.ensure([], (require) => {
        callback(null, require('gp-core/lib/components/unsubscribe/UnsubscribeHandler').default);
      }, 'unsubscribe');
    },
  };
}
