import { combineReducers } from 'redux';
import editorReducer from '@gostgroup/gp-constructor/lib/redux/reducer';
import session from './session';
import objects from './objects';
import record from './record';
import recordDraft from './recordDraft';
import sysInfo from './sysInfo';
import app from './app';
import element from './element';
import deduplication from './deduplication';
import history from './history';
import rfc from './rfc/reducer';

export function createCoreReducer(...asyncReducers) {
  const reducers = {
    ...asyncReducers,
    session,
    objects,
    record,
    recordDraft,
    sysInfo,
    element,
    app,
    deduplication,
    history,
    rfc,
    editor: editorReducer,
  };
  asyncReducers.forEach(ar => Object.assign(reducers, ar));
  return combineReducers(reducers);
}

export default createCoreReducer();
