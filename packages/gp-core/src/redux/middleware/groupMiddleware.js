import { push, LOCATION_CHANGE } from 'react-router-redux';
import { selectObject } from '../modules/objects';

// При переходе в группу инициируется ее выбор
const isObject = pathname => pathname.includes('groups') || pathname.includes('elements') || pathname.includes('records');
const extractGroup = pathname => pathname
  .replace('/groups/', '')
  .replace('/elements/', '')
  .replace('/records/', '');

export default store => next => (action) => {
  const { type, payload = {} } = action;
  if (type === LOCATION_CHANGE) {
    const { pathname } = payload;
    const historyAction = payload.action;

    if (pathname === '/groups/') {
      console.warn('Redirect from /groups/'); // eslint-disable-line no-console
      store.dispatch(push('/groups/nsi'));
      return;
    } else if (isObject(pathname)) {
      if (historyAction !== 'REPLACE') {
        const absolutPath = extractGroup(pathname);
        store.dispatch(selectObject(absolutPath));
      }
    }
  }
  next(action);
};
