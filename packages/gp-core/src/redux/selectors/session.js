import { createSelector } from 'reselect';
import get from 'lodash/get';

export const getCurrentUser = createSelector(
  state => state.core.session,
  ({ currentUser }) => currentUser,
);

export const getCurrentUserId = createSelector(
  getCurrentUser,
  user => get(user, 'id'),
);
