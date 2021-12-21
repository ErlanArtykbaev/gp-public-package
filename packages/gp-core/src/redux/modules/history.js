import { handleActions, createAction } from 'redux-actions';
import {
  ProcessHistoryService,
  RfcProcessHistoryService,
  RfcSubProcessHistoryService,
  RfcItemService,
} from '@gostgroup/gp-api-services/lib/services';
import constFactory from '@gostgroup/gp-redux-utils/lib/constFactory';

const createConst = constFactory('gp-core/lib/history/');
const initialState = {
  history: null,
  historyElement: {},
};

export const getHistory = createAction(createConst('getHistory'), processId => ProcessHistoryService.path(processId).get());
export const getRfcProcessHistory = createAction(createConst('getRfcProcessHistory'), processId => RfcProcessHistoryService.path(processId).get());
export const getRfcSubProcessHistory = createAction(createConst('getRfcSubProcessHistory'), processId => RfcSubProcessHistoryService.path(processId).get());
export const getRfcHistoryElement = createAction(createConst('getRfcHistoryElement'), uuid => RfcItemService.path(uuid).get());

export default handleActions({
  [getHistory]: (state, { payload }) => ({ ...state, history: payload }),
  [getRfcProcessHistory]: (state, { payload }) => ({ ...state, history: payload }),
  [getRfcSubProcessHistory]: (state, { payload }) => ({ ...state, history: payload }),
  [getRfcHistoryElement]: (state, { payload }) => ({ ...state, historyElement: payload }),
}, initialState);
