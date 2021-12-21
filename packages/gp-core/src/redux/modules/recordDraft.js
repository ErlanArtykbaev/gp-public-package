import { actionsFactory, handleActions } from '@gostgroup/gp-redux-utils/lib/actions';
import makeUUID from 'uuid';
import moment from 'moment';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';

import { updateVersion } from './record';
import { createRecordAndRefresh } from './element';

const PATH = 'gp-core/lib/recordDrafts/';
const createAction = actionsFactory(PATH);
const elementPathFromRecordPath = path => path.replace(/\/[^/]+$/, '');

const initialState = {
  drafts: [],
};

export const startRecordCreation = createAction('startRecordCreation',
  (elementPath, patch = {}) => ({ elementPath, patch })
);

export const startRecordEdit = createAction('startRecordEdit',
  (absolutPath, version, patch = {}) => ({ absolutPath, version, patch })
);

export const stageDraft = createAction('stageDraft',
  (draftId, patch = {}) => ({ draftId, patch })
);

export const flushDraft = createAction('flushDraft', draftId => ({ draftId }));

export function saveDraft(draftId) {
  return (dispatch, getState) => {
    const draft = getState().core.recordDraft.drafts.find(d => d.draftId === draftId);
    return dispatch(
      draft.isNew
        ? createRecordAndRefresh(draft.elementPath, {
          startDate: createValidDate(moment()),
          endDate: null,
          cleanData: draft.patch,
        })
        : updateVersion(draft.absolutPath, {
          startDate: draft.version.dateStart,
          version: draft.version,
          endDate: draft.version.dateEnd || null,
          cleanData: draft.patch,
        })
    ).then(() => dispatch(flushDraft(draftId)));
  };
}

export function saveDraftsInElement(elementPath) {
  return (dispatch, getState) => {
    // TODO refresh once
    const elementDrafts = getState().core.recordDraft.drafts
      .filter(d => d.elementPath === elementPath);
    return Promise.all(elementDrafts.map(d => dispatch(saveDraft(d.draftId))));
  };
}

const patchDraft = (state, meta, patch) => {
  const oldStored = state.drafts.find(d => d.draftId === meta.draftId);
  const baseDraft = oldStored || { patch: {} };
  const assembledDraft = { ...baseDraft, ...meta, patch: { ...baseDraft.patch, ...patch } };
  return ({
    ...state,
    drafts: oldStored
      ? state.drafts.map(d => d.draftId === meta.draftId ? assembledDraft : d)
      : state.drafts.concat(assembledDraft),
  });
};

export default handleActions({
  [startRecordCreation]: (state, { payload }) => (
    patchDraft(
      state,
      { elementPath: payload.elementPath, draftId: makeUUID(), isNew: true },
      { ...payload.patch }
    )
  ),
  [startRecordEdit]: (state, { payload }) => {
    const { absolutPath, version, patch } = payload;
    return patchDraft(
      state,
      { elementPath: elementPathFromRecordPath(absolutPath), version, draftId: absolutPath, absolutPath },
      { ...patch }
    );
  },
  [stageDraft]: (state, { payload }) => (
    patchDraft(state, { draftId: payload.draftId }, payload.patch)
  ),
  [flushDraft]: (state, { payload }) => ({
    ...state,
    drafts: state.drafts.filter(d => d.draftId !== payload.draftId),
  }),
}, initialState);
