import { combineReducers } from 'redux';
import config from './config';
import outbox from './outbox';
import importOutbox from './importOutbox';
import inbox from './inbox';
import draft from './draft';
import restore from './restore';
import codingTables from './codingTables';

export default combineReducers({
  config,
  outbox,
  importOutbox,
  inbox,
  draft,
  restore,
  codingTables,
});
