import { actionsFactory, handleActions } from '@gostgroup/gp-redux-utils/lib/actions';
import {
  ProcessesService,
  ProcessesMetaService,
  UsersService,
  RfcRolesService,
  RfcOrganizationsService,
} from '@gostgroup/gp-api-services/lib/services';
import { onSuccess, withFetchFlow } from '@gostgroup/gp-redux-utils/lib/flow';

const PATH = 'gp-core/lib/rfc/config/';
const createAction = actionsFactory(PATH);

const initialState = {
  processes: [],
  all_meta: {},
  users: null,
  roles: null,
};

export const getUsers = createAction('getUsers',
  (role = 'approve_rfc') => UsersService.get({ role })
);

export const getRoles = createAction('getRoles',
  () => RfcRolesService.get()
);

export const getOrganizations = createAction('getOrganizations',
  (type = 'approve_rfc') => RfcOrganizationsService.get({ type })
);

export const getProcessesList = createAction('getProcessesList',
  () => ProcessesService.get()
);

export const getProcessesMeta = createAction('getProcessesMeta',
  () => ProcessesMetaService.get()
);

const reducer = handleActions({
  [onSuccess(getUsers)]: {
    next(state, { payload }) {
      const users = [];
      payload.map((user) => {
        if (user.enable) {
          const option = {
            id: user.id,
            name: user.name,
            displayName: user.fio,
            sidType: 'user',
          };
          users.push(option);
        }
      });
      return {
        ...state,
        users,
      };
    },
  },
  [onSuccess(getProcessesList)]: {
    next(state, { payload }) {
      return {
        ...state,
        processes: payload,
      };
    },
  },
  [onSuccess(getProcessesMeta)]: {
    next(state, { payload }) {
      return {
        ...state,
        all_meta: payload,
      };
    },
  },
  [onSuccess(getRoles)]: {
    next(state, { payload }) {
      const { flatRoleMembers = [] } = payload;
      const roles = [];
      flatRoleMembers.map((role) => {
        const option = {
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          sidType: 'role',
        };
        roles.push(option);
      });
      return {
        ...state,
        roles,
      };
    },
  },
  [onSuccess(getOrganizations)]: {
    next(state, { payload }) {
      const organizations = [];
      payload.map((org) => {
        const option = {
          id: org.id,
          name: org.name,
          displayName: org.displayName,
          sidType: 'organization',
        };
        organizations.push(option);
      });
      return {
        ...state,
        organizations,
      };
    },
  },
}, initialState);

export default withFetchFlow(
  getUsers,
  getProcessesList,
  getProcessesMeta,
  getRoles,
  getOrganizations,
)(reducer);
