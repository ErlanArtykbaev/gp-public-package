import * as reports from '@gostgroup/gp-module-reports/lib/components';
import permissions from './config/permissions';

const requiredPermissions = permissions.reports;
const indexRoute = 'operations';

export default function getRoutes({ getSession, index }) {
  function checkRoutePermissions(nextState, replace, callback) {
    if (nextState.location.pathname === '/reports/') {
      replace(`/reports/${indexRoute}`);
      callback();
    }
    const currentUser = getSession().currentUser;
    const userPermissions = currentUser.permissions || [];
    if (requiredPermissions.length && !requiredPermissions.filter(p => userPermissions.indexOf(p) + 1).length) {
      replace(index);
    }
    callback();
  }

  return {
    path: 'reports',
    component: reports.layout,
    onEnter: checkRoutePermissions,
    childRoutes: [
      {
        path: 'operations',
        component: reports.operations,
      },
      {
        path: 'imports',
        component: reports.imports,
      },
      {
        path: 'users',
        component: reports.users,
      },
      {
        path: 'experts',
        component: reports.experts,
      },
      {
        path: 'rfc-restore',
        component: reports.rfcRestore,
      },
      {
        path: 'quality',
        component: reports.quality,
      },
      {
        path: 'user-log',
        component: reports.userLog,
      },
      {
        path: 'user-comments',
        component: reports.userComments,
      },
      {
        path: 'security',
        component: reports.security,
      },
    ],
  };
}
