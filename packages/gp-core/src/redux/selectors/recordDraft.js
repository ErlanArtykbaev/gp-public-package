import { createSelector } from 'reselect';

const draftsSelector = state => state.core.recordDraft.drafts;

export const elementNewDraftsSelector = createSelector(
  draftsSelector,
  drafts => elementPath => drafts.filter(d => d.elementPath === elementPath && d.isNew)
);

export const elementHasDraftsSelector = createSelector(
  draftsSelector,
  drafts => elementPath => drafts.some(d => d.elementPath === elementPath)
);

export const recordDraftSelector = createSelector(
  draftsSelector,
  drafts => absolutPath => drafts.find(d => d.absolutPath === absolutPath)
);
