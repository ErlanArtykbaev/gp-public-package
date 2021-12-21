import { createSelector } from 'reselect';
import { makeGetLoadingState } from '@gostgroup/gp-redux-utils/lib/flow';

const stateSelector = state => state.core.record;

export const getRecordState = createSelector(
  stateSelector,
  state => state,
);

export const getLoadingState = makeGetLoadingState('record');

export const getPath = createSelector(
  stateSelector,
  ({ path }) => path,
);
