import { checkRoutePermissions } from './config/permissions';

export default function getRoutes({ getSession, index }) {
  return {
    path: 'ref-import',
    onEnter: checkRoutePermissions('refImport', getSession, index),
    getComponent(nextState, callback) {
      require.ensure([], (require) => {
        callback(null, require('gp-core/lib/components/import/ImportHandler').default);
      }, 'import');
    },
  };
}
