import { checkRoutePermissions } from '@gostgroup/gp-core/lib/routes/config/permissions';

export default function getRoutes({ getSession, index }) {
  return {
    path: 'ref-import',
    onEnter: checkRoutePermissions('refImport', getSession, index),
    getComponent(nextState, callback) {
      require.ensure([], (require) => {
        callback(null, require('@gostgroup/gp-module-import/lib/components/ImportHandler').default);
      }, 'import');
    },
  };
}
