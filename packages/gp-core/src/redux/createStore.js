import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { autoRehydrate } from 'redux-persist';
import customStateReconciler from '@gostgroup/gp-redux-utils/lib/persist';
import promiseMiddleware from './middleware/promiseMiddleware';
import injectableStore from './injectableStore';
import coreMiddleware from './middleware';
import { defaultRouterMiddleware } from '../routes';

export default function createStore(createReducer, additionalMiddleware = []) {
  const middleware = [thunk, promiseMiddleware, createLogger({ collapsed: true }), ...coreMiddleware, defaultRouterMiddleware, ...additionalMiddleware];
  const finalCreateStore = compose(
    autoRehydrate({
      log: true,
      stateReconciler: customStateReconciler,
    }),
    applyMiddleware(...middleware),
    injectableStore(createReducer),
  )(_createStore);

  const finalReducer = createReducer();

  const store = finalCreateStore(finalReducer);
  return store;
}
