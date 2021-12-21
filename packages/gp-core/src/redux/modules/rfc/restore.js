import { handleActions } from 'redux-actions';
import {
  RfcRestoredItemsService,
  RfcRestoreService,
} from '@gostgroup/gp-api-services/lib/services';

const GET_RESTORED_ITEMS = 'gp-core/lib/rfc/restore/getRestoredItems';

const initialState = {
  items: [],
};

export default handleActions({
  [GET_RESTORED_ITEMS]: {
    next(state, { payload }) {
      return {
        ...state,
        items: payload,
      };
    },
  },
}, initialState);

export function getRestoredAtomicRfc() {
  return {
    type: GET_RESTORED_ITEMS,
    payload: RfcRestoredItemsService.get(),
  };
}

export function restoreAtomicRfc(uuid) {
  return dispatch => RfcRestoreService.path(uuid).post()
    .then(() => dispatch(getRestoredAtomicRfc()));
}
