import { isFSA } from 'flux-standard-action';
import { onInit, onSuccess, onError } from '@gostgroup/gp-redux-utils/lib/flow';

function isPromise(val) {
  return val && typeof val.then === 'function';
}

export default function promiseMiddleware({ dispatch }) {
  return next => (action) => {
    if (!isFSA(action)) {
      return isPromise(action)
        ? action.then(dispatch)
        : next(action);
    }

    if (isPromise(action.payload)) {
      dispatch({ type: onInit(action.type), meta: action.meta });
      return action.payload.then(
        (result) => {
          dispatch({ ...action, type: onSuccess(action.type), payload: result });
          return dispatch({ ...action, payload: result });
        },
        (error) => {
          dispatch({ type: onError(action.type) });
          dispatch({ ...action, payload: error, error: true });
          return Promise.reject(error);
        }
      );
    }

    return next(action);
  };
}
