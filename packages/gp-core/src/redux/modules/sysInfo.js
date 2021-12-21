import { actionsFactory, handleActions } from '@gostgroup/gp-redux-utils/lib/actions';
import get from 'lodash/get';
import {
  SysInfoSocket,
} from '@gostgroup/gp-api-services/lib/ws/services';
import { notify } from '../sideeffects/notifications';
import { sysInfoSelector, initialSysInfoDataIsLoaded } from '../selectors/sysInfo';
import { getCurrentUserId } from '../selectors/session';

const PATH = 'gp-core/lib/sysInfo/';
const createAction = actionsFactory(PATH);

export const initSocket = createAction('initSocket');
export const closeSocket = createAction('closeSocket');
export const getSocketData = createAction('getSocketData');

const initialState = {
  sysInfo: {
    rfcIncome: 0,
    draft: 0,
  },
  initialDataIsLoaded: false,
  isConnected: false,
  isReconnecting: false,
};

export default handleActions({
  [getSocketData]: {
    next(state, { payload }) {
      return {
        ...state,
        sysInfo: payload,
        initialDataIsLoaded: true,
      };
    },
  },
}, initialState);

function getSysInfo(payload) {
  return (dispatch, getState) => {
    // NOTE проверяем что кол-во запросов увеличилось
    const state = getState();
    // FIXME добавить обозначение роли которой будет капать
    const administrators = ['sys', 'manager'];
    const currentUserId = getCurrentUserId(state);
    if (administrators.includes(currentUserId)) {
      const sysInfoData = sysInfoSelector(state);
      const previousDraft = get(sysInfoData, 'draft', 0);
      const newDraft = get(payload, 'draft', 0);
      const previousIncome = get(sysInfoData, 'rfcIncome', 0);
      const newIncome = get(payload, 'rfcIncome', 0);
      if (newDraft > previousDraft && initialSysInfoDataIsLoaded(state)) {
        dispatch(notify('Информация', 'Создан новый запрос на изменения.', 'info'));
      }
      if (newIncome > previousIncome && initialSysInfoDataIsLoaded(state)) {
        dispatch(notify('Информация', 'Новый входящий запрос.', 'info'));
      }
    }

    dispatch(getSocketData(payload));
  };
}

function makeInitSocket() {
  return (dispatch) => {
    dispatch(initSocket());
    return new Promise((res) => {
      SysInfoSocket.open().on('data', data => dispatch(getSysInfo(data)));
      res();
    });
  };
}

export function createSysInfoSocket() {
  return dispatch => dispatch(makeInitSocket());
}

export function closeSysInfoSocket() {
  return (dispatch) => {
    dispatch(closeSocket());
    SysInfoSocket.close();
  };
}
