import { checkRoutePermissions } from './config/permissions';

export default function getRoute({ getSession, index }) {
  return {
    path: 'pack-control',
    onEnter: checkRoutePermissions('packControl', getSession, index),
    getComponent(nextState, callback) {
      require.ensure([], (require) => {
        callback(null, require('@gostgroup/gp-module-pack-control/lib').default);
      }, 'packControl');
    },
  };
}
