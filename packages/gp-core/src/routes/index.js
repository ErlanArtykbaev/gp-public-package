import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';
import get from 'lodash/get';
import defaultHistory from './config/history';

export redirectFromRoot from './utils/redirectFromRoot';
export function createHistory(store) {
  return syncHistoryWithStore(defaultHistory, store, {
    // NOTE https://github.com/reactjs/react-router-redux/blob/master/src/sync.js
    // true (которое по дефолту) ломало все
    adjustUrlOnReplay: false,
  });
}

export const defaultRouterMiddleware = routerMiddleware(defaultHistory);

export const history = defaultHistory;

export default function getRoutes(RootComponent, options) {
  return {
    path: '/',
    component: RootComponent,
    onChange: RootComponent.onChange,
    onEnter: RootComponent.onEnter,
    getChildRoutes(partialNextState, callback) {
      require.ensure([], (require) => {
        callback(null, [
          require('./login').default(options),
          require('./content').default(options),
          ...(get(options, 'getChildRoutes.index', () => [])(options)),
        ]);
      });
    },
  };
}
