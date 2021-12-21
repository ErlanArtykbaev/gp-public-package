import { LOCATION_CHANGE } from 'react-router-redux';
import { getRecord } from '../modules/record';

// При переходе в запись она фетчится
const isRecord = pathname => pathname.indexOf('records') > -1;
const extractGroup = pathname => pathname.replace('/records/', '');

export default store => next => (action) => {
  const { type, payload = {} } = action;
  if (type === LOCATION_CHANGE) {
    const { pathname, query } = payload;
    if (isRecord(pathname)) {
      const absolutPath = extractGroup(pathname);
      store.dispatch(getRecord(absolutPath, query));
    }
  }
  next(action);
};
