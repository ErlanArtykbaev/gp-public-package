import {
  GraphService,
} from '@gostgroup/gp-api-services/lib/services';
import { handleActions, actionsFactory } from '@gostgroup/gp-redux-utils/lib/actions';
import { onSuccess, onInit, withFetchFlow } from '@gostgroup/gp-redux-utils/lib/flow';

/* Module */
const PATH = 'gp-core/lib/graph/';
const createAction = actionsFactory(PATH);

const initialState = {
  graph: null,
};

/* Actions */

const makeGetGraph = createAction('makeGetGraph',
  (...path) => GraphService.path(...path).get(),
);
export function getAllGraph() {
  return dispatch => dispatch(makeGetGraph('all'));
}
export function getGraphById(id) {
  return dispatch => dispatch(makeGetGraph('id', id));
}

export const drawingProcess = createAction('drawingProcess');
export const initDrawingProcess = createAction(onInit('drawingProcess'));
export const finishDrawingProcess = createAction(onSuccess('drawingProcess'));


/* Reducer */

const reducer = handleActions({
  [onSuccess(makeGetGraph)]: {
    next(state, { payload }) {
      return {
        ...state,
        graph: payload,
      };
    },
  },
}, initialState);

export default withFetchFlow(
  makeGetGraph,
  drawingProcess,
)(reducer);
