import { createSelector } from 'reselect';
import memoize from 'lodash/memoize';
import { REDUCER_KEY } from '../constants';

const stateSelector = state => state[REDUCER_KEY];

export const sidebarIsOpenSelector = createSelector(
  stateSelector,
  ({ sidebarIsOpen }) => sidebarIsOpen,
);

export const layersSelector = createSelector(
  stateSelector,
  ({ layers }) => layers,
);

export const getLayerGroups = createSelector(
  stateSelector,
  ({ geojson }) => geojson,
);

export const getSelectedLayers = createSelector(
  stateSelector,
  ({ selectedLayers }) => selectedLayers,
);

export const getGroupLayers = createSelector(
  [getSelectedLayers, getLayerGroups],
  (selectedLayers, layerGroups) => memoize(
    (group) => {
      const layers = (layerGroups[group] || []);
      const selectedLayersInGroup = selectedLayers[group];
      return layers.filter(l => selectedLayersInGroup.includes(l.type.id));
    }
  ),
);

export const selectedLayersSelector = createSelector(
  stateSelector,
  ({ selectedLayers }) => selectedLayers,
);
