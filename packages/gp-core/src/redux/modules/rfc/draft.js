import { handleActions } from 'redux-actions';
import get from 'lodash/get';
import {
  RfcDraftService,
  RfcDeleteService,
  RfcRequestService,
  RfcActionService,
  RfcInboxService,
} from '@gostgroup/gp-api-services/lib/services';

const GET_DRAFTS = 'gp-core/lib/rfc/draft/getRfcDraft';
const GET_ERRORS = 'gp-core/lib/rfc/draft/getErrors';

const initialState = {
  drafts: [],
  errors: {},
};

export default handleActions({
  [GET_DRAFTS]: {
    next(state, { payload }) {
      return {
        ...state,
        drafts: payload,
      };
    },
  },
  [GET_ERRORS]: {
    next(state, { payload = {} }) {
      if (Object.keys(payload).length === 0) {
        return state;
      }
      return {
        ...state,
        errors: {
          ...payload,
          validateDataResult: {
            errors: payload.validateDataResult,
          },
        },
      };
    },
  },
}, initialState);

export function getRfcDraft() {
  return {
    type: GET_DRAFTS,
    payload: RfcDraftService.get(),
  };
}

export function sendRfcDelete(data) {
  return dispatch => RfcDeleteService.post(data)
    .then(() => dispatch(getRfcDraft()));
}

export function handleErrors(payload) {
  return {
    type: GET_ERRORS,
    payload,
  };
}

export function sendRfcRequest(data) {
  return dispatch => RfcRequestService.post(data)
    .then((r) => {
      dispatch(handleErrors(r));
      return dispatch(getRfcDraft());
    });
}

export function processDraftAction(task, action) {
  return dispatch => RfcActionService.path(task, action).post()
    .then(() => dispatch(getRfcDraft()));
}

export function editProcessDraftEntry(processId, elementPath, data, entry) {
  const payload = {
    id: get(entry, 'id', ''),
    shortTitle: data.shortTitle,
    fullTitle: data.fullTitle,

    version: {
      id: get(entry, 'version.id', ''),
      data: data.cleanData,
    },
  };

  if (data.startDate) {
    payload.version.dateStart = data.startDate;
  }

  if (data.endDate) {
    payload.version.dateEnd = data.endDate;
  }

  return dispatch => RfcInboxService.path(processId, elementPath).post(payload)
    .then(() => dispatch(getRfcDraft()));
}

export function editProcessDraftGroup(processId, path, data) {
  const payload = {
    ...data,
    parent: path,
  };

  return dispatch => RfcInboxService.path('group', processId).post(payload)
    .then(() => dispatch(getRfcDraft()));
}

export function editProcessDraftElement(processId, parent, data) {
  // TODO spread operator ...data.main_data
  const payload = {
    ...data.main_data,
    schema: data.schema,
    key: data.schema.id,
    id: data.schema.id,
    description: '',
    parent,
  };

  return dispatch => RfcInboxService.path('element', processId).post(payload)
    .then(() => dispatch(getRfcDraft()));
}
