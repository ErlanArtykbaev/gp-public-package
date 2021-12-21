import {
  TreeService,
  GroupService,
  DeleteGroupService,
  RestoreGroupService,
  RootService,
  SubscribeService,
} from '@gostgroup/gp-api-services/lib/services';
import { actionsFactory, handleActions } from '@gostgroup/gp-redux-utils/lib/actions';
import { push } from 'react-router-redux';
import { onInit, onSuccess, withFetchFlow } from '@gostgroup/gp-redux-utils/lib/flow';
import { openModalReducer, closeModalReducer } from '../utils/modalsState';

const PATH = 'gp-core/lib/objects/';
const createAction = actionsFactory(PATH);

const OPEN_MODAL = 'openModal';
const CLOSE_MODAL = 'closeModal';

const initialState = {
  objectsTree: {},
  selectedPath: null,
  favourites: {},
  modalsState: {
    createElement: false,
    createGroup: false,
    editGroup: false,
    deleteGroup: false,
    deleteHardGroup: false,
    restoreGroup: false,
    subscribeChanges: false,
  },
  fetchState: {},
};

export const openModal = createAction(OPEN_MODAL);
export const closeModal = createAction(CLOSE_MODAL);
export const openCreateElementModal = createAction(OPEN_MODAL, () => 'createElement');
export const closeCreateElementModal = createAction(CLOSE_MODAL, () => 'createElement');
export const openCreateGroupModal = createAction(OPEN_MODAL, () => 'createGroup');
export const closeCreateGroupModal = createAction(CLOSE_MODAL, () => 'createGroup');
export const openEditGroupModal = createAction(OPEN_MODAL, () => 'editGroup');
export const closeEditGroupModal = createAction(CLOSE_MODAL, () => 'editGroup');
export const openDeleteGroupModal = createAction(OPEN_MODAL, () => 'deleteGroup');
export const closeDeleteGroupModal = createAction(CLOSE_MODAL, () => 'deleteGroup');
export const openDeleteHardGroupModal = createAction(OPEN_MODAL, () => 'deleteHardGroup');
export const closeDeleteHardGroupModal = createAction(CLOSE_MODAL, () => 'deleteHardGroup');
export const openRestoreGroupModal = createAction(OPEN_MODAL, () => 'restoreGroup');
export const closeRestoreGroupModal = createAction(CLOSE_MODAL, () => 'restoreGroup');
export const openSubscribeChangesModal = createAction(OPEN_MODAL, () => 'subscribeChanges');
export const closeSubscribeChangesModal = createAction(CLOSE_MODAL, () => 'subscribeChanges');

export const addToFavourites = createAction('addToFavourites');
export const removeFromFavourites = createAction('removeFromFavourites');
export const getObjectTree = createAction('getObjectTree', () => TreeService.get());
export const selectObject = createAction('selectObject');

export const makeCreateGroup = createAction('makeCreateGroup',
  (path, data) => GroupService.path(path).post(data),
);
export function createGroup(path, data) {
  data.isAvailable = true;
  return dispatch => dispatch(makeCreateGroup(path, data))
    .then(() => dispatch(getObjectTree()))
    .then(() => dispatch(closeCreateGroupModal()));
}

export const makeUpdateGroup = createAction('makeUpdateGroup',
  (path, data) => GroupService.path(path).put(data),
);
export function updateGroup(path, data) {
  data.isAvailable = true;
  return dispatch => dispatch(makeUpdateGroup(path, data))
    .then(() => dispatch(getObjectTree()))
    .then(() => dispatch(closeEditGroupModal()));
}

export const makeDeleteGroupRFC = createAction('makeDeleteGroupRFC',
  path => DeleteGroupService.path(path).delete(),
);
export function deleteGroupRFC(path) {
  return dispatch =>
    dispatch(makeDeleteGroupRFC(path))
      .then(() => dispatch(getObjectTree()))
      .then(() => dispatch(closeDeleteGroupModal()));
}

export const makeRestoreGroupRFC = createAction('makeRestoreGroupRFC',
  splat => RestoreGroupService.path(splat).put()
);
export function restoreGroupRFC(splat) {
  const parent = splat.split('/').slice(0, -1).join('/');
  return dispatch =>
    dispatch(makeRestoreGroupRFC(splat))
      .then(() => dispatch(getObjectTree()))
      .then(() => {
        dispatch(closeRestoreGroupModal());
        dispatch(push(`/groups/${parent}`));
      });
}

export const makeDeleteGroup = createAction('makeDeleteGroup',
  splat => RootService.path(splat).delete(),
);
export function deleteGroup(splat) {
  const parent = splat.split('/').slice(0, -1).join('/');
  return dispatch => dispatch(makeDeleteGroup(splat))
    .then(() => dispatch(getObjectTree()))
    .then(() => {
      dispatch(closeDeleteHardGroupModal());
      dispatch(push(`/groups/${parent}`));
    });
}

export const makeSubscribeChanges = createAction('makeSubscribeChanges', data => SubscribeService.post(data));
export function subscribeChanges(data) {
  return dispatch => dispatch(makeSubscribeChanges(data))
    .then(() => dispatch(closeSubscribeChangesModal()));
}

const reducer = handleActions({
  [onSuccess(getObjectTree)]: (state, { payload }) => ({ ...state, objectsTree: payload }),
  [selectObject]: (state, { payload }) => ({ ...state, selectedPath: payload }),
  [addToFavourites]: (state, { payload }) => ({
    ...state,
    favourites: Object.assign({}, state.favourites, {
      [payload.absolutPath]: payload,
    }),
  }),
  [removeFromFavourites]: (state, { payload }) => ({
    ...state,
    favourites: Object.assign({}, state.favourites, {
      [payload.absolutPath]: undefined,
    }),
  }),
  [openModal]: openModalReducer,
  [closeModal]: closeModalReducer,
}, initialState);

export default withFetchFlow(
  getObjectTree,
  makeCreateGroup,
  makeUpdateGroup,
  makeSubscribeChanges,
  makeDeleteGroup,
)(reducer);
