import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import intersection from 'lodash/intersection';
import { compose, withProps } from 'recompose';
import withUserPermissions from './withUserPermissions';

const toArray = arg => (
  (Array.isArray(arg) ? arg : arg.split(',').filter(p => p.length)).filter(i => !!i)
);
const includes = (superarray, array) => !isEmpty(intersection(array, superarray));

export default compose(
  withUserPermissions,
  withProps(({ userPermissions = [], config }) => {
    const permissions = {
      create: toArray(get(config, 'config.accessConfig.create', '')),
      update: toArray(get(config, 'config.accessConfig.update', '')),
      read: toArray(get(config, 'config.accessConfig.read', '')),
    };
    const checkPermission = key => (
      isEmpty(permissions[key]) ||
      includes(userPermissions, permissions[key])
    );
    return {
      accessFields: {
        isUpdatable: checkPermission('update'),
        isCreatable: checkPermission('create'),
        isReadable: checkPermission('read'),
      },
      userPermissions,
    };
  })
);
