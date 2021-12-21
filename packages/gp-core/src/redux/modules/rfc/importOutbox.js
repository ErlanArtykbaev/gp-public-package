import { handleActions } from 'redux-actions';
import {
  RfcImportOutcomeService,
} from '@gostgroup/gp-api-services/lib/services';
import get from 'lodash/get';

const GET_IMPORT_OUTCOME_ITEM = 'gp-core/lib/rfc/importOutbox/getRfcImportOutcomeItem';

const initialState = {
  rfc: null,
  count: null,
};

export default handleActions({
  [GET_IMPORT_OUTCOME_ITEM]: {
    next(state, { payload }) {
      const { items, count } = payload;
      const rfc = get(items, 0, null);
      return {
        ...state,
        rfc,
        count,
      };
    },
  },
}, initialState);

export function getRfcImportOutcomeItem(page = 1) {
  return dispatch => RfcImportOutcomeService.get({ page }).then(payload =>
    dispatch({
      type: GET_IMPORT_OUTCOME_ITEM,
      payload,
    })
  );
}
