import { makeGetLoadingState } from '@gostgroup/gp-redux-utils/lib/flow';
import { createSelector } from 'reselect';

const stateSelector = state => state.rfc.inbox;

export const getLoadingState = makeGetLoadingState('rfc/inbox');

export const countSelector = createSelector(
  stateSelector,
  ({ count }) => count,
);

export const pageSelector = createSelector(
  stateSelector,
  ({ page }) => page,
);

export const isLastInboxItem = createSelector(
  countSelector,
  pageSelector,
  (count, page) => count === page,
);
