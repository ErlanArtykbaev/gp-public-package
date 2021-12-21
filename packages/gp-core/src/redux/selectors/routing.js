import { createSelector } from 'reselect';
import memoize from 'lodash/memoize';

const stateSelector = state => state.routing.locationBeforeTransitions;
const pathnameSelector = createSelector(
  stateSelector,
  state => state && state.pathname,
);

const splatSelector = createSelector(
  pathnameSelector,
  pathname => (pathname || []).split('/').slice(2).join('/')
);

const querySelector = createSelector(
  stateSelector,
  ({ query }) => query,
);

const queryKeySelector = createSelector(
  querySelector,
  query => memoize(
    key => query[key],
  ),
);

export {
  pathnameSelector,
  splatSelector,
  querySelector,
  queryKeySelector,
};
