import { checkRoutePermissions } from './config/permissions.js';

export default function getRoutes({ getSession, index }) {
  return {
    path: 'rfc',
    onEnter: checkRoutePermissions('rfc', getSession, index),
    childRoutes: [
      {
        path: 'outbox',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/rfc/outbox/RfcOutboxHandler').default);
          }, 'rfcOutbox');
        },
      },
      {
        path: 'inbox',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/rfc/inbox/RfcInboxHandler').default);
          }, 'rfcInbox');
        },
      },
      {
        path: 'import-outbox',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/rfc/import-outbox/RfcImportOutboxHandler').default);
          }, 'rfcImportOutbox');
        },
      },
      {
        path: 'settings',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/rfc/settings/RfcSettingsHandler').default);
          }, 'rfcSettings');
        },
      },
      {
        path: 'draft',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/rfc/draft/RfcDraftHandler').default);
          }, 'rfcDraft');
        },
      },
      {
        path: 'coding-table',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/rfc/coding-table/RfcCodingTableHandler').default);
          }, 'rfcCodingTable');
        },
      },
      {
        path: 'restore',
        getComponent(nextState, callback) {
          require.ensure([], (require) => {
            callback(null, require('gp-core/lib/components/objects/rfc/restore/RfcRestoreHandler').default);
          }, 'rfcRestore');
        },
      },
    ],
  };
}
