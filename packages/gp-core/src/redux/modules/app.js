import { handleActions, createAction } from 'redux-actions';
// import { push } from 'react-router-redux';
import { createSysInfoSocket } from './sysInfo';
import { getObjectTree } from './objects';
import { getPermissionGroups } from './session';

const FINISH_INITIALIZATION = 'gp-core/lib/app/finishInitialization';
const START_INITIALIZATION = 'gp-core/lib/app/startInitialization';
const initializationFailed = 'gp-core/lib/app/initializationFailed';

const initialState = {
  isInitialized: false,
  initializationFailed: false,
};

export const finishInitialization = createAction(FINISH_INITIALIZATION);
export const startInitialization = createAction(START_INITIALIZATION);
export const initializationFail = createAction(initializationFailed);

export function initApp() {
  return (dispatch) => {
    dispatch(startInitialization());
    dispatch(createSysInfoSocket())
    .then(() => dispatch(getObjectTree()))
    // .then(() => dispatch(getPermissionGroups()))
    .then(() => dispatch(finishInitialization()))
    .catch(() => {
      dispatch(finishInitialization());
    });
  };
}

export default handleActions({
  [startInitialization]: state => ({ ...state, isInitialized: false }),
  [finishInitialization]: state => ({ ...state, isInitialized: true }),
  [initializationFail]: state => ({
    ...state,
    initializationFailed: true,
    isInitialized: false,
  }),
}, initialState);

// if (error instanceof Error) {
//   dispatch(finishInitialization());
//   // console.log(error); // eslint-disable-line no-console
//   // if (error.toString().indexOf('User') > -1) {
//   //   dispatch(finishInitialization());
//   //   dispatch(push('/login'));
//   // } else if (error.toString().indexOf('Server') > -1) {
//   //   // this.setState({ serverIsOff: true });
//   // }
//   // this.setState({ loading: false });
// }
