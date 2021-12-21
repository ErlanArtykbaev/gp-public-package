import { handleActions, actionsFactory } from '@gostgroup/gp-redux-utils/lib/actions';
import objectHasValue from '@gostgroup/gp-utils/lib/objectHasValue';

const createAction = actionsFactory('EDITOR/');

/* Initial state */

const initialState = {
  valid: true,
  validationResults: {
  },
};

/* Actions */

export const resetState = createAction('resetState');

export const setValidationResults = createAction('setValidationResults',
  (path, isValid) => ({ path, isValid }),
);

/* Reducer */

const reducer = handleActions({
  [resetState]: () => ({
    ...initialState,
  }),
  [setValidationResults]: (state, { payload }) => {
    const validationResults = {
      ...state.validationResults,
      [payload.path]: payload.isValid,
    };
    return {
      ...state,
      validationResults,
      valid: !objectHasValue(validationResults, false),
    };
  },
}, initialState);

export default reducer;
