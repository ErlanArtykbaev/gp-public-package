import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

export default function createStore(reducer) {
  const middleware = [thunk, createLogger({ collapsed: true })];
  const finalCreateStore = compose(
    applyMiddleware(...middleware),
  )(_createStore);

  const store = finalCreateStore(reducer);
  return store;
}
