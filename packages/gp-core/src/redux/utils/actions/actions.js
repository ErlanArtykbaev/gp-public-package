import {
  createAction as baseCreateAction,
} from 'redux-actions';
import { INIT, ERROR, SUCCESS, IS_FETCHING } from '../flow';

export const createAction = baseCreateAction;

export const actionsFactory = (path = '') =>
  (actionType, payloadCreator, metaCreator = (...args) => ({ args })) =>
  baseCreateAction(path + actionType, payloadCreator, metaCreator);
