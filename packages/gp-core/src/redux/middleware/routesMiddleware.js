import { push, LOCATION_CHANGE } from 'react-router-redux';
import objectToQueryString from '@gostgroup/gp-utils/lib/objectToQueryString';
import { pathnameSelector } from '../selectors/routing';

export default store => next => (action) => {
  const { type, payload = {} } = action;
  const nextPath = payload.pathname;
  const { search } = payload;
  if (type === LOCATION_CHANGE) {
    const redirectPath = pathnameSelector(store.getState());
    if (nextPath.includes('login') && redirectPath && !redirectPath.includes('login') && !search.length) {
      store.dispatch(push({
        pathname: '/login',
        search: `?${objectToQueryString({ redirectPath })}`,
      }));
      return;
    }
  }
  next(action);
};
