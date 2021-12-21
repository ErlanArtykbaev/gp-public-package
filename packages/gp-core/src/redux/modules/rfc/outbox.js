import { handleActions } from 'redux-actions';
import {
  RfcOutcomeService,
} from '@gostgroup/gp-api-services/lib/services';
import get from 'lodash/get';

const GET_OUTCOME_ITEM = 'gp-core/lib/rfc/outbox/getRfcOutcomeItem';

const initialState = {
  rfc: null,
  count: null,
};

export default handleActions({
  [GET_OUTCOME_ITEM]: {
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

export function getRfcOutcomeItem(page = 1) {
  return dispatch => RfcOutcomeService.get({ page }).then(payload =>
    dispatch({
      type: GET_OUTCOME_ITEM,
      payload,
    })
  );
}
