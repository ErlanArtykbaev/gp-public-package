import { actionsFactory, handleActions, handlePayload } from '@gostgroup/gp-redux-utils/lib/actions';
import omit from 'lodash/omit';
import get from 'lodash/get';
import {
  ElementService,
  ElementMoveService,
  RootService,
  DeleteElementService,
  RestoreElementService,
  GlobalTypeService,
  DeduplicationAsyncService,
  DeduplicationResultLinkService,
} from '@gostgroup/gp-api-services/lib/services';
import createRecordHelper from '@gostgroup/gp-api-services/lib/helpers/record/createRecord';
import getGlobalTypesHelper from '@gostgroup/gp-api-services/lib/helpers/element/getGlobalTypes';
import fetchAndAssembleEmbedRefs from '@gostgroup/gp-api-services/lib/helpers/element/fetchAndAssembleEmbedRefs';
import convertPropertyFilters from '@gostgroup/gp-nsi-utils/lib/element/convertPropertyFilters';
import getReferenceData from '@gostgroup/gp-api-services/lib/helpers/element/getReferenceData';
import moment from 'moment';
import { push } from 'react-router-redux';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';
import DISPLAY_MODE from 'gp-core/lib/constants/element/displayMode';
import {
  getObjectTree,
  closeCreateElementModal,
  closeModal as closeObjectModal,
} from './objects';
import { getRecord } from './record';
import {
  DEFAULT_ELEMENT_CONFIG,
} from '../constants/element';
import { elementSelector, pageSelector, elementMetaSelector, getShowNotAvailable } from '../selectors/element';
import { splatSelector, querySelector, queryKeySelector } from '../selectors/routing';
import { notify } from '../sideeffects/notifications';
import { onSuccess, withFetchFlow } from '@gostgroup/gp-redux-utils/lib/flow';

/* Module */
const createAction = actionsFactory('gp-core/lib/element/');

const OPEN_MODAL = 'openModal';
const CLOSE_MODAL = 'closeModal';

const defaultStateValues = {
  page: 0,
  displayMode: DISPLAY_MODE.TABLE_VIEW,
  showNotAvailable: false,
  reference_data: {},
};

const initialState = {
  globalTypes: null,
  selectedElement: null,
  reference_data: null,
  config: {},
  element: null,
  elementsByPath: {},
  deduplicationLink: '',
  modalsState: {
    move: false,
    deleteHard: false,
    deleteRfc: false,
    restoreRfc: false,
    settings: false,
    element: false,
    record: false,
  },
  ...defaultStateValues,
};

/* Actions */

export const openModal = createAction(OPEN_MODAL);
export const closeModal = createAction(CLOSE_MODAL);
export const openMoveElementModal = createAction(OPEN_MODAL, () => 'move');
export const closeMoveElementModal = createAction(CLOSE_MODAL, () => 'move');
export const openDeleteElementHardModal = createAction(OPEN_MODAL, () => 'deleteHard');
export const closeDeleteElementHardModal = createAction(CLOSE_MODAL, () => 'deleteHard');
export const openDeleteElementModal = createAction(OPEN_MODAL, () => 'deleteRfc');
export const closeDeleteElementModal = createAction(CLOSE_MODAL, () => 'deleteRfc');
export const openRestoreElementModal = createAction(OPEN_MODAL, () => 'restoreRfc');
export const closeRestoreElementModal = createAction(CLOSE_MODAL, () => 'restoreRfc');
export const openElementSettingsModal = createAction(OPEN_MODAL, () => 'settings');
export const closeElementSettingsModal = createAction(CLOSE_MODAL, () => 'settings');
export const openElementModal = createAction(OPEN_MODAL, () => 'element');
export const closeElementModal = createAction(CLOSE_MODAL, () => 'element');
export const openRecordModal = createAction(OPEN_MODAL, () => 'record');
export const closeRecordModal = createAction(CLOSE_MODAL, () => 'record');

export const resetElement = createAction('resetElement');
export const fetchElement = createAction('fetchElement',
  (fullPath, params = {}) => fetchAndAssembleEmbedRefs(fullPath, params),
);

export const storeElement = createAction('storeElement',
  (fullPath, params = {}) => fetchAndAssembleEmbedRefs(fullPath, params, false),
);

export const changeElementDate = date => (dispatch, getState) => {
  const state = getState();
  const splat = splatSelector(state);

  if (date === null) {
    return dispatch(push({
      pathname: `/elements/${splat}`,
    }));
  }

  const dateString = createValidDate(moment(date));

  return dispatch(push({
    pathname: `/elements/${splat}`,
    query: {
      date: dateString,
    },
  }));
};

export function getElement({ fullPath, date, page, perPage, filter, order = { entry_id: 'asc' } }) {
  return (dispatch) => {
    if (typeof date === 'undefined') {
      date = createValidDate(moment());
    }

    let payload = {
      date,
    };
    if (typeof page !== 'undefined') {
      payload = {
        ...payload,
        page,
        perPage,
        filter,
        order,
      };
    }

    if (typeof filter !== 'undefined') {
      payload.filter = filter;
    }

    console.warn('get Element');
    console.log(fullPath, payload);

    return dispatch(fetchElement(fullPath, payload));
  };
}

export function getCurrentElement() {
  return (dispatch, getState) => {
    const state = getState();
    const fullPath = splatSelector(state);
    const date = queryKeySelector(state)('date');
    const page = pageSelector(state);
    const elementMeta = elementMetaSelector(state)(fullPath);
    const showNotAvailable = getShowNotAvailable(state);
    const { itemsForPage, propertyFilters, order } = elementMeta;
    const payload = {
      fullPath,
      date,
      page: page + 1,
      perPage: itemsForPage,
      filter: {
        is_available: true,
        ...convertPropertyFilters(propertyFilters),
      },
    };

    if (showNotAvailable) {
      delete payload.filter.is_available;
    }

    return dispatch(getElement(payload));
  };
}

export function changeElement() {
  return (dispatch) => {
    dispatch(resetElement());
    return dispatch(getCurrentElement());
  };
}

export const setElementMeta = createAction('setElementMeta',
  (value, path, key) => ({ value, path, key }),
);

export const makeCreateElement = createAction('makeCreateElement',
  (parent, schema, main_data, service) => {
    const payload = {
      id: main_data.key,
      parent: parent.absolutPath,
      isAvailable: true,
      ...omit(main_data, ['key']),
      schema,
    };
    payload.schema.id = main_data.key;
    payload.schema.title = main_data.shortTitle;

    // Используем кастомный сервис для создания элемента, если он передан
    if (service) {
      return service.post(payload);
    }

    return ElementService.post(payload);
  }
);

export function createElement(parent, schema, main_data, service) {
  return dispatch => dispatch(makeCreateElement(parent, schema, main_data, service))
    .then((result) => {
      return dispatch(getObjectTree())
        .then(() => {
          dispatch(closeCreateElementModal());
          dispatch(closeObjectModal(main_data.type));
          return result;
        });
    });
}

export const makeUpdateElement = createAction('makeUpdateElement',
  (parent, schema, main_data) => {
    const payload = {
      id: main_data.key,
      parent: parent.absolutPath,
      isAvailable: true,
      ...omit(main_data, ['key', 'isInlineEditable']),
      schema,
    };

    return ElementService.put(payload);
  }
);
export function updateElement(parent, schema, main_data) {
  return (dispatch, getState) => dispatch(makeUpdateElement(parent, schema, main_data))
    .then(() => {
      dispatch(getObjectTree());
      dispatch(closeElementModal());
      return dispatch(getCurrentElement());
    });
}

export const makeDeleteElementRFC = createAction('makeDeleteElementRFC',
  splat => DeleteElementService.path(splat).delete()
);
export function deleteElementRFC(splat) {
  const parent = splat.split('/').slice(0, -1).join('/');
  return dispatch => dispatch(makeDeleteElementRFC(splat))
    .then(() => dispatch(getObjectTree()))
    .then(() => {
      dispatch(closeDeleteElementModal());
      dispatch(push(`/groups/${parent}`));
    });
}

export const makeRestoreElementRFC = createAction('makeRestoreElementRFC',
  splat => RestoreElementService.path(splat).put(),
);
export function restoreElementRFC(splat) {
  const parent = splat.split('/').slice(0, -1).join('/');
  return dispatch => dispatch(makeRestoreElementRFC(splat))
    .then(() => dispatch(getObjectTree()))
    .then(() => {
      dispatch(closeRestoreElementModal());
      dispatch(push(`/groups/${parent}`));
    });
}

export const makeDeleteElement = createAction('makeDeleteElement',
  splat => RootService.path(splat).delete(),
);
export function deleteElement(splat) {
  const parent = splat.split('/').slice(0, -1).join('/');
  return dispatch => dispatch(makeDeleteElement(splat))
    .then(() => dispatch(getObjectTree()))
    .then(() => {
      dispatch(closeDeleteElementHardModal());
      dispatch(push(`/groups/${parent}`));
    });
}

export const makeMoveElement = createAction('makeMoveElement',
  payload => ElementMoveService.post(payload)
);
export function moveElement(path_to_element, path_to_group) {
  const payload = {
    path_to_element,
    path_to_group,
  };

  return dispatch => dispatch(makeMoveElement(payload))
    .then((result) => {
      console.log(result); // FIXME undefined
      const { new_element_url, error } = result;
      if (error) {
        dispatch(notify('Ошибка', error.detail, 'error'));
      } else {
        dispatch(getObjectTree())
        .then(() => {
          dispatch(closeMoveElementModal());
          dispatch(push({
            pathname: `/elements/${new_element_url}`,
          }));
          dispatch(notify('Информация', 'Справочник перемещен успешно.', 'info'));
        });
      }
    })
    .catch((e) => {
      console.log(e);
      dispatch(notify('Внимание', 'Произошла ошибка', 'error'));
    });
}

export const makeCreateGlobalType = createAction('makeCreateGlobalType',
  (schema) => {
    const payload = {
      key: schema.id,
      id: schema.id,
      name: schema.title,
      schema,
    };

    return GlobalTypeService.post(payload);
  }
);
export function createGlobalType(schema) {
  return dispatch => dispatch(makeCreateGlobalType(schema));
}

export const makeCreateRecord = createAction('makeCreateRecord',
  (parentPath, data) => createRecordHelper(parentPath, data),
);
export function createRecordAndRefresh(parentPath, data) {
  return dispatch => dispatch(makeCreateRecord(parentPath, data))
    // .then(() => dispatch(getCurrentElement()))
    .then(() => dispatch(changeElementDate(null)))
    .then(() => dispatch(closeRecordModal()));
}

export const getGlobalTypes = createAction('getGlobalTypes', getGlobalTypesHelper);

export const makeGetReferenceData = createAction('makeGetReferenceData',
  (element, date) => getReferenceData(element, date, true),
);
export const makeChangeDisplayMode = createAction('makeChangeDisplayMode');
export const makeChangePage = createAction('makeChangePage');

export function changeDisplayMode(displayMode) {
  return (dispatch, getState) => {
    const state = getState();
    const splat = splatSelector(state);
    const query = querySelector(state);
    const showNotAvailable = getShowNotAvailable(state);

    dispatch(makeChangeDisplayMode(displayMode));

    if (displayMode === DISPLAY_MODE.TREE_VIEW) {
      const payload = {
        fullPath: splat,
        date: query.date,
        filter: {
          is_available: true,
        },
      };
      if (showNotAvailable) {
        delete payload.filter.is_available;
      }
      return dispatch(getElement(payload))
        .then(() => {
          const element = elementSelector(getState());
          return dispatch(makeGetReferenceData(element, query.date));
        });
    }

    dispatch(makeChangePage(0));
    return dispatch(getCurrentElement());
  };
}

export function changePage(page) {
  return (dispatch) => {
    dispatch(makeChangePage(page));
    dispatch(getCurrentElement());
  };
}

export const checkDeduplicationAsync = createAction('checkDeduplicationAsync',
  absolutPath => DeduplicationAsyncService.path(absolutPath).get()
);

export const getDuplicationResultLink = createAction('getDuplicationResultLink',
  absolutPath => DeduplicationResultLinkService.path(absolutPath).get()
);

export function deduplicationAsync(absolutPath) {
  return (dispatch) => {
    dispatch(checkDeduplicationAsync(absolutPath))
      .then(() => {
        dispatch(getDuplicationResultLink(absolutPath));
        dispatch(getObjectTree());
      });
  };
}

export const makeToggleShowNotAvailable = createAction('makeToggleShowNotAvailable');
export function toggleShowNotAvailable() {
  return (dispatch) => {
    dispatch(makeToggleShowNotAvailable());
    dispatch(getCurrentElement());
  };
}

/* Reducer */

const reducer = handleActions({
  [onSuccess(fetchElement)]: {
    next(state, { payload }) {
      return {
        ...state,
        element: payload,
        elementsByPath: {
          ...state.elementsByPath,
          [payload.element.absolutPath]: payload.element,
        },
      };
    },
  },
  [onSuccess(getRecord)]: {
    next(state, { payload }) {
      const { record } = payload;
      const elementPath = record.element.absolutPath;
      const isCurrent = get(state.element, ['element', 'absolutPath']) === elementPath;

      if (!isCurrent) return state;

      return {
        ...state,
        element: ({
          ...state.element,
          versions: {
            ...state.element.versions,
            items: state.element.versions.items
              .map(v => v.absolutPath === record.absolutPath ? record : v),
          },
        }),
      };
    },
  },
  [onSuccess(storeElement)]: {
    next(state, { payload }) {
      return {
        ...state,
        elementsByPath: {
          ...state.elementsByPath,
          [payload.element.absolutPath]: payload.element,
        },
      };
    },
  },
  [onSuccess(getGlobalTypes)]: (state, { payload }) => ({ ...state, globalTypes: payload }),
  [setElementMeta]: {
    next(state, { payload }) {
      const { value, path, key } = payload;
      const { config } = state;
      const elementConfig = config[path] || { ...DEFAULT_ELEMENT_CONFIG };
      elementConfig[key] = value;
      return {
        ...state,
        config: Object.assign({}, config, {
          [path]: elementConfig,
        }),
      };
    },
  },
  [onSuccess(makeGetReferenceData)]: handlePayload('reference_data'),
  [makeChangePage]: handlePayload('page'),
  [makeChangeDisplayMode]: handlePayload('displayMode'),
  [openModal]: (state, { payload }) => ({ ...state, modalsState: { ...state.modalsState, [payload]: true } }),
  [closeModal]: (state, { payload }) => ({ ...state, modalsState: { ...state.modalsState, [payload]: false } }),
  [resetElement]: state => ({ ...state, ...defaultStateValues }),
  [onSuccess(getDuplicationResultLink)]: handlePayload('deduplicationLink'),
  [makeToggleShowNotAvailable]: state => ({ ...state, showNotAvailable: !state.showNotAvailable }),
}, initialState);

export default withFetchFlow(
  storeElement,
  getGlobalTypes,
  makeUpdateElement,
  makeCreateElement,
  makeMoveElement,
  makeCreateRecord,
  fetchElement,
)(reducer);
