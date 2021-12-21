import get from 'lodash/get';
import memoize from 'lodash/memoize';
import { createSelector } from 'reselect';
import { makeGetLoadingState } from '@gostgroup/gp-redux-utils/lib/flow';
import {
  DEFAULT_ELEMENT_CONFIG,
} from '../constants/element';

const stateSelector = state => state.core.element;

export const elementSelector = createSelector(
  stateSelector,
  (state) => {
    const element = get(state, 'element.element');
    return element;
  }
);

export const currentElementSchemaSelector = createSelector(
  elementSelector,
  element => get(element, 'schema'),
);

const elementConfigSelector = createSelector(
  stateSelector,
  ({ config }) => config,
);

export const pageSelector = createSelector(
  stateSelector,
  ({ page }) => page,
);

export const elementMetaSelector = createSelector(
  elementConfigSelector,
  config => memoize(
    absolutPath => get(config, absolutPath, Object.assign({}, DEFAULT_ELEMENT_CONFIG))
  )
);

export const getShowNotAvailable = createSelector(
  stateSelector,
  ({ showNotAvailable }) => showNotAvailable,
);

export const elementFetchStatusSelector = (state, key) =>
  get(state, ['core', 'element', 'fetchState', key]);

export const getStoredElement = (appState, key) => {
  const state = stateSelector(appState);
  return get(state.elementsByPath, key);
};

export const getLoadingState = makeGetLoadingState('element');
