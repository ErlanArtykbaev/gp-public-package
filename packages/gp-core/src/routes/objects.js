import moment from 'moment';
import get from 'lodash/get';
import Layout from 'gp-core/lib/components/objects/IndexHandler';
import { checkRoutePermissions } from './config/permissions';

function fetchRecord(nextState, replace, callback) {
  const { query, pathname } = nextState.location;

  if (!query.date || !query.version) {
    const date = query.date || moment().format(global.SERVER_DATETIME_FORMAT);
    const version = query.version || 1;
    replace({
      pathname,
      query: {
        version,
        date,
      },
    });
  }
  callback();
}

function onRecordChange(prevState, nextState, replace, callback) {
  return fetchRecord(nextState, replace, callback);
}

export function elementLikeRoute(type, getComponent) {
  return {
    path: `${type}s/*`,
    getComponent,
  };
}

export default function getRoutes({ getSession, index, getChildRoutes }) {
  return {
    component: Layout,
    onEnter: checkRoutePermissions('objects', getSession, index),
    childRoutes: [
      {
        path: 'groups/*',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/group/GroupHandler').default);
          }, 'group');
        },
      },
      {
        path: 'elements/*',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/element/ElementHandler').default);
          }, 'element');
        },
      },
      {
        path: 'records/*',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/record/RecordHandler').default);
          }, 'record');
        },
        onEnter: fetchRecord,
        onChange: onRecordChange,
      },
      {
        path: 'search/*',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('@gostgroup/gp-module-search/lib').default);
          }, 'search');
        },
      },
      ...(get(getChildRoutes, 'objects', () => [])({ getSession, index })),
    ],
  };
}
