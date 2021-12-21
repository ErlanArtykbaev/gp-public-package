import {
  PackageControlService,
} from '@gostgroup/gp-api-services/lib/services';
import { handleActions } from 'redux-actions';

const GET_CONFIG = 'gp-core/lib/package-control/getConfig';
const GET_SINGLE_RESULT = 'gp-core/lib/package-control/getSingleResult';
// const START = 'gp-core/lib/package-control/start';
// const STOP = 'gp-core/lib/package-control/stop';
// const RESET = 'gp-core/lib/package-control/reset';

const initialState = {
  config: null,
  singleResult: null,
};

export default handleActions({
  [GET_CONFIG]: {
    next(state, { payload }) {
      return {
        ...state,
        config: payload,
      };
    },
  },
  [GET_SINGLE_RESULT]: {
    next(state, { payload }) {
      return {
        ...state,
        singleResult: payload,
      };
    },
  },
}, initialState);

export function getConfig() {
  const promise = PackageControlService.path('config').get();
  return (dispatch) => {
    promise.then((payload) => {
      dispatch({
        type: GET_CONFIG,
        payload,
      });
    });
  };
}

export function getPacketControlConfig() {
  return getConfig();
}

export function resetPacketCheckResult() {
  return PackageControlService.path('reset').post().then(getConfig);
}

export function startPacketCheck(payload) {
  return PackageControlService.path('start').post(payload).then(getConfig);
}

export function packetControlStop() {
  return PackageControlService.path('start').post().then(getConfig);
}

export function getSingleResult(uuid) {
  return PackageControlService.path('result', uuid).get();
}
