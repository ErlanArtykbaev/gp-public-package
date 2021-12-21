import { upsert } from '@gostgroup/gp-utils/lib/immutable/array';
import { actionsFactory, handleActions } from '@gostgroup/gp-redux-utils/lib/actions';
import { onSuccess } from '@gostgroup/gp-redux-utils/lib/flow';
import getStaticLayers from '../../api/helpers/getStaticLayers';
import getLayerService from '../../api/helpers/getLayer';
import { REDUCER_KEY } from '../constants';

const toggleArrayElement = (initialArray = [], element) => {
  const array = initialArray.slice();
  const elementIndex = array.indexOf(element);
  if (elementIndex > -1) {
    array.splice(elementIndex, 1);
  } else {
    array.push(element);
  }
  return array;
};

const createAction = actionsFactory(`${REDUCER_KEY}/`);

export const toggle = createAction('toggle');

const initialState = {
  sidebarIsOpen: false,
  layers: [],
  selectedLayers: {},
  geojson: {},
};

export const getLayers = createAction('getLayers', path => getStaticLayers(path));
export const getLayer = createAction('getLayer', (path, group, type) => getLayerService(path, group, type));
export const makeSelectLayer = createAction('makeSelectLayer', (group, type) => ({ group, type }));
export function selectLayer(path, group, type) {
  return (dispatch) => {
    dispatch(getLayer(path, group, type));
    dispatch(makeSelectLayer(group, type));
  };
}

const reducer = handleActions({
  [toggle]: state => ({
    ...state,
    sidebarIsOpen: !state.sidebarIsOpen,
  }),
  [onSuccess(getLayers)]: (state, { payload }) => ({
    ...state,
    layers: payload,
  }),
  [onSuccess(getLayer)]: (state, { payload }) => {
    const { group, type } = payload;
    const currentGroupLayers = (state.geojson[group.id] || []);
    return {
      ...state,
      geojson: {
        ...state.geojson,
        [group.id]: upsert(currentGroupLayers, t => t.type.id === type.id, payload),
      },
    };
  },
  [makeSelectLayer]: (state, { payload }) => ({
    ...state,
    selectedLayers: {
      ...state.selectedLayers,
      [payload.group.id]: toggleArrayElement(state.selectedLayers[payload.group.id], payload.type.id),
    },
  }),
}, initialState);

export default reducer;
