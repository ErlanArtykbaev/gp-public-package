import { permissionErrorPath } from './config/permissions';

export default function getRoutes() {
  return {
    name: 'permission-error',
    path: permissionErrorPath,
    getComponent(nextState, callback) {
      require.ensure([], (require) => {
        callback(null, require('gp-core/lib/components/errors/PermissionError').default);
      }, 'loginPage');
    },
  };
}
