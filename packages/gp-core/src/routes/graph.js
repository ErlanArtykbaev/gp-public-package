import { checkRoutePermissions } from './config/permissions';

export default function getRoutes({ getSession, index }) {
  return {
    path: 'graph',
    onEnter: checkRoutePermissions('graph', getSession, index),
    getComponent(nextState, callback) {
      require.ensure([], (require) => {
        callback(null, require('@gostgroup/gp-module-graph/lib').default);
      }, 'graph');
    },
    childRoutes: [
      {
        path: '*',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('@gostgroup/gp-module-graph/lib').default);
          }, 'graph');
        },
      },
    ],
  };
}
