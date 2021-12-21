import { actionsFactory, handleActions } from '@gostgroup/gp-redux-utils/lib/actions';
import { push } from 'react-router-redux';
import {
  AuthService,
  ConfigService,
  LogoutService,
  RolesService,
} from '@gostgroup/gp-api-services/lib/services';
import User from '@gostgroup/gp-models/lib/User.js';
import { closeSysInfoSocket } from '../modules/sysInfo';
import { initApp } from './app';
import { onInit, onSuccess, onError } from '@gostgroup/gp-redux-utils/lib/flow';
import { queryKeySelector } from '../selectors/routing';

const PATH = 'gp-core/lib/session/';
const createAction = actionsFactory(PATH);

const initialState = {
  currentUser: null,
  userPermissions: [],
  permissionGroups: [],
  session: null,
  sessionError: null,
  config: {},
  isLoading: false,
};

const makeLogin = createAction('login',
  data => AuthService.post(data).then(
    user => ({
      user,
      session: {
        login: data.login,
      },
    }),
  )
);

export function login(data) {
  return (dispatch, getState) => dispatch(makeLogin(data))
    .then(() => {
      const redirectPath = queryKeySelector(getState())('redirectPath');
      // TODO добавить обработку nextPath
      dispatch(initApp());
      dispatch(push(redirectPath || '/groups/nsi'));
    });
}

export const makeLogout = createAction('makeLogout');
export function logout(payload = { forced: true }) {
  return (dispatch) => {
    LogoutService.get().catch(() => {});
    dispatch(makeLogout(payload));
    dispatch(closeSysInfoSocket());

    if (payload.forced) {
      localStorage.clear();
      window.location.reload();
      return;
    }

    dispatch(push('/login'));
  };
}

export const getPermissionGroups = createAction('getPermissionGroups',
  () => RolesService.get()
);

const makeGetConfig = createAction('getConfig',
  (type, user) => ConfigService.path(`${user}/${type}`).get().then(result => ({ type, data: result.value }))
);
export function getConfig(type) {
  return (dispatch, getState) => {
    const user = getState().core.session.currentUser.id;
    dispatch(makeGetConfig(type, user));
  };
}

const makeSetConfig = createAction('setConfig',
  (type, user, data) => ConfigService.path(`${user}/${type}`).post(data).then(() => ({ type, data }))
);
export function setConfig(type, data) {
  return (dispatch, getState) => {
    const user = getState().core.session.currentUser.id;
    dispatch(makeSetConfig(type, user, data));
  };
}

const handleGetConfig = {
  next(state, { payload }) {
    const { type, data } = payload;
    return {
      ...state,
      config: {
        ...state.settings,
        [type]: data,
      },
    };
  },
};

export default handleActions({
  [onInit(makeLogin)]: state =>
    ({ ...state, sessionError: null, isLoading: true }),
  [onError(makeLogin)]: state =>
    ({ ...state, sessionError: { reason: 'wrong credentials' }, isLoading: false }),
  [onSuccess(makeLogin)]: {
    next(state, { payload }) {
      const { session, user } = payload;
      const currentUser = new User(user);
      return {
        ...state,
        currentUser,
        userPermissions: currentUser.permissions,
        session,
        sessionError: null,
        isLoading: false,
      };
    },
  },
  [makeLogout]: {
    next(state, { payload }) {
      return {
        ...initialState,
        sessionError: payload,
      };
    },
  },
  [onSuccess(getPermissionGroups)]: (state, { payload = [] }) => ({
    ...state,
    permissionGroups: payload.map(p => ({ id: p.identifier, title: p.title })),
  }),
  [onSuccess(makeGetConfig)]: handleGetConfig,
  [onSuccess(makeSetConfig)]: handleGetConfig,
}, initialState);
