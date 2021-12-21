const permissions = {
  objects: ['nsi.read'],
  rfc: ['nsi.rfc.read'],
  unsubscribe: ['nsi.unsubscribe.read'],
  packControl: ['nsi.pack-control.read'],
  refImport: ['nsi.ref-import.read'],
  reports: ['report_nsi_viewer'],
  graph: ['nsi.relations.read'],
};

export const permissionErrorPath = 'permission-error';

export function checkRoutePermissions(key, getSession, INDEX_PAGE) {
  const requiredPermissions = permissions[key];
  return (nextState, replace, callback) => {
    const currentUser = getSession().currentUser;
    const userPermissions = currentUser.permissions || [];
    if (requiredPermissions.length && !requiredPermissions.filter(p => userPermissions.indexOf(p) + 1).length) {
      const looping = nextState.location.pathname === INDEX_PAGE;
      replace(looping ? permissionErrorPath : INDEX_PAGE);
    }
    callback();
  };
}

export default permissions;
