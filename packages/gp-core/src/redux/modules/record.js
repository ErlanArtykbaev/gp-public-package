import { actionsFactory, handleActions } from '@gostgroup/gp-redux-utils/lib/actions';
import get from 'lodash/get';
import last from 'lodash/last';
import moment from 'moment';
import { push } from 'react-router-redux';
import {
  RecordService,
  DeleteEntryService,
  RestoreEntryService,
} from '@gostgroup/gp-api-services/lib/services';
import createNewVersion from '@gostgroup/gp-api-services/lib/helpers/record/createNewVersion';
import updateVersionHelper from '@gostgroup/gp-api-services/lib/helpers/record/updateVersion';
import getVersionDate from '@gostgroup/gp-nsi-utils/lib/record/getVersionDate';
import { onInit, onSuccess, onError, withFetchFlow } from '@gostgroup/gp-redux-utils/lib/flow';
import { getRecordState } from '../selectors/record';

const PATH = 'gp-core/lib/record/';
const createAction = actionsFactory(PATH);

const SAVE = 'gp-core/lib/record/saveRecord';
const OPEN_MODAL = 'openModal';
const CLOSE_MODAL = 'closeModal';

const initialState = {
  isFetching: false,
  record: null,
  recordsByPath: {},
  modalsState: {
    newVersion: false,
    update: false,
    delete: false,
    restore: false,
  },
};

export const openModal = createAction(OPEN_MODAL);
export const closeModal = createAction(CLOSE_MODAL);
export const openNewVersionModal = createAction(OPEN_MODAL, () => 'newVersion');
export const closeNewVersionModal = createAction(CLOSE_MODAL, () => 'newVersion');
export const openUpdateVersionModal = createAction(OPEN_MODAL, () => 'update');
export const closeUpdateVersionModal = createAction(CLOSE_MODAL, () => 'update');
export const openDeleteVersionModal = createAction(OPEN_MODAL, () => 'delete');
export const closeDeleteVersionModal = createAction(CLOSE_MODAL, () => 'delete');
export const openRestoreVersionModal = createAction(OPEN_MODAL, () => 'restore');
export const closeRestoreVersionModal = createAction(CLOSE_MODAL, () => 'restore');

export const getRecord = createAction('getRecord',
  (path, query) => RecordService.path(path).get(query)
    .then(record => ({
      record,
      query,
      path,
    }))
);

export function getCurrentRecord() {
  return (dispatch, getState) => {
    const state = getState();
    const { path } = getRecordState(state);
    dispatch(getRecord(path));
  };
}

export function saveRecord(path, query = {}) {
  return dispatch => RecordService.path(path).get(query).then(payload =>
    dispatch({
      type: SAVE,
      payload: {
        record: payload,
        query,
      },
    })
  );
}

export function deleteEntryRFC(fullPath) {
  const parent = fullPath.split('/').slice(0, -1).join('/');
  return dispatch => DeleteEntryService.path(fullPath).delete()
    .then(() => {
      dispatch(closeDeleteVersionModal());
      dispatch(push(`/elements/${parent}`));
    });
}

export function restoreEntryRFC(splat) {
  const parent = splat.split('/').slice(0, -1).join('/');
  return dispatch => RestoreEntryService.path(splat).put()
    .then(() => {
      dispatch(closeRestoreVersionModal());
      dispatch(push(`/elements/${parent}`));
    });
}


const makeAddNewVersion = createAction('addNewVersion', createNewVersion);
export function addNewVersion(fullPath, data) {
  return dispatch => dispatch(makeAddNewVersion(fullPath, data))
    .then(() =>
      dispatch(getRecord(fullPath))
      .then(() => dispatch(closeNewVersionModal()))
    );
}

export const makeUpdateVersion = createAction('updateVersion', updateVersionHelper);
export function updateVersion(fullPath, data) {
  return dispatch => dispatch(makeUpdateVersion(fullPath, data))
    .then(() =>
      dispatch(getRecord(fullPath))
      .then(() => dispatch(closeUpdateVersionModal()))
    );
}

const reducer = handleActions({
  [onInit(getRecord)]: state => ({ ...state, isFetching: true }),
  [onError(getRecord)]: state => ({ ...state, isFetching: false }),
  [onSuccess(getRecord)]: {
    next(state, { payload }) {
      const { record, query = {}, path } = payload;
      const versionId = get(record, 'versionId');
      const versions = get(record, 'versions');
      const version = versionId ? (versions || []).find(v => v.id === versionId) : last(versions);
      return {
        ...state,
        path,
        record,
        version,
        versionId,
        versions,
        date: moment(query.date || getVersionDate(version)),
        recordsByPath: {
          ...state.recordsByPath,
          [record.absolutPath]: record,
        },
        isFetching: false,
      };
    },
  },
  [SAVE]: {
    next(state, { payload }) {
      const { record } = payload;
      return {
        ...state,
        recordsByPath: {
          ...state.recordsByPath,
          [record.absolutPath]: record,
        },
      };
    },
  },
  [openModal]: (state, { payload }) => ({ ...state, modalsState: { ...state.modalsState, [payload]: true } }),
  [closeModal]: (state, { payload }) => ({ ...state, modalsState: { ...state.modalsState, [payload]: false } }),
}, initialState);

export default withFetchFlow(
  makeUpdateVersion,
  makeAddNewVersion,
)(reducer);
