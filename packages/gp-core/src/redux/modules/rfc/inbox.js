import { actionsFactory, handleActions, handlePayload } from '@gostgroup/gp-redux-utils/lib/actions';
import { isDiffableRfcRecord, isDiffableRfcElement } from '@gostgroup/gp-utils/lib/util';
import {
  RfcIncomeService,
  RfcActionService,
  RfcRemoveService,
  RfcRemoveRestoreService,
  RfcItemsService,
  RfcInboxProcessService,
  RfcDuplicateService,
  RfcExistDuplicateService,
  RfcNotDuplicateService,
} from '@gostgroup/gp-api-services/lib/services';
import get from 'lodash/get';
import { storeElement } from '../element';
import { saveRecord } from '../record';
import { getObjectTree } from '../objects';
import { notify } from '../../sideeffects/notifications';
import { onInit, onSuccess, withFetchFlow } from '@gostgroup/gp-redux-utils/lib/flow';
// import { isLastInboxItem } from '../../selectors/rfc/inbox';

const PATH = 'gp-core/lib/rfc/inbox/';
const createAction = actionsFactory(PATH);

const initialState = {
  rfc: null,
  count: null,
  subProcessesItems: {},
  page: 0,
};

export const getItem = createAction('getItem');
export const getItemFlow = createAction('getItemFlow');

export function getRfcIncomeItem(page = 0) {
  return (dispatch) => {
    // if (isLastInboxItem(getState())) {
    //   page -= 1;
    // }
    dispatch({ type: onInit(getItemFlow) });
    return RfcIncomeService.get({ page: page + 1 })
      .then((data) => {
        const { items, count } = data;
        const rfc = get(items, 0, null);
        const subProcessesItems = {};
        if (rfc) {
          rfc.subProcesses.forEach((sp) => {
            sp.items.items.forEach((item) => {
              if (isDiffableRfcRecord(item.type)) {
                dispatch(saveRecord(item.entry.absolutPath));
              } else if (isDiffableRfcElement(item.type)) {
                dispatch(storeElement(item.element.absolutPath));
              }
            });
            subProcessesItems[sp.id] = sp.items;
          });
          dispatch({ type: onSuccess(getItemFlow) });
          dispatch(getItem({ rfc, count, subProcessesItems }));
        } else {
          dispatch(getItem({ rfc, count, subProcessesItems }));
          dispatch({ type: onSuccess(getItemFlow) });
        }
      });
  };
}

export const getRfcIncomeItemSubProcessItems = createAction('getRfcIncomeItemSubProcessItems',
  (subProcessId, page) => RfcItemsService.path(subProcessId)
    .get({ page: page + 1 })
    .then(items => ({ subProcessId, items }))
);

export const makeProcessRfcAction = createAction('makeProcessRfcAction',
  (task, action, comment) => RfcActionService.path(task, action).post({ comment }),
);
export function processRfcAction(task, action, page, comment = '') {
  return dispatch => dispatch(makeProcessRfcAction(task, action, comment))
    .then(() => {
      dispatch(getObjectTree());
      dispatch(getRfcIncomeItem(page));
    })
    .catch(() => {
      dispatch(getRfcIncomeItem(page));
    });
}

export function setRemoved(uuid, processId, page) {
  return dispatch => RfcRemoveService.path(processId, uuid).post()
    .then(() => {
      dispatch(getRfcIncomeItem(page));
    });
}

export function restoreRemoved(uuid, processId, page) {
  return dispatch => RfcRemoveRestoreService.path(processId, uuid).post()
    .then(() => {
      dispatch(getRfcIncomeItem(page));
    });
}

export const resetFetchState = createAction('resetFetchState');

const makeSetIncomePage = createAction('makeSetIncomePage');
export function setIncomePage(page) {
  return (dispatch) => {
    dispatch(makeSetIncomePage(page));
    dispatch(getRfcIncomeItem(page));
  };
}

export function editProcessEntry(processId, elementPath, data, entry, uuid, page) {
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

  return dispatch => RfcInboxProcessService.path(processId, uuid, elementPath).post(payload)
    .then(() => dispatch(getRfcIncomeItem(page)))
    .catch(() => dispatch(notify('Внимание', 'Не удалось совершить действие. Произошла ошибка', 'error')));
}

export function editProcessElement(processId, parent, data, uuid, page) {
  const payload = {
    schema: data.schema,
    key: data.schema.id,
    id: data.schema.id,
    description: '',
    parent,
    ...data.main_data,
  };
  return dispatch => RfcInboxProcessService.path('element', processId, uuid).post(payload)
    .then(() => dispatch(getRfcIncomeItem(page)))
    .catch(() => dispatch(notify('Внимание', 'Не удалось совершить действие. Произошла ошибка', 'error')));
}

export function editProcessGroup(processId, path, data, uuid, page) {
  const payload = {
    parent: path,
    ...data,
  };
  return dispatch => RfcInboxProcessService.path('group', processId, uuid).post(payload)
    .then(() => dispatch(getRfcIncomeItem(page)))
    .catch(() => dispatch(notify('Внимание', 'Не удалось совершить действие. Произошла ошибка', 'error')));
}

export const setDuplicate = createAction('setDuplicate',
  (uuid1, uuid2, processId) => RfcDuplicateService.path(processId, uuid1, uuid2).post(),
);

export const setNotDuplicate = createAction('setNotDuplicate',
  (uuid1, uuid2, processId) => RfcNotDuplicateService.path(processId, uuid1, uuid2).post(),
);

export const setDublicateExistItem = createAction('setDublicateExistItem',
  (item1, item2) => RfcExistDuplicateService.path(item1.subProcessId, item1.uuid, item2.savedEntryId, item2.savedEntryVersionId).post(),
);

const reducer = handleActions({
  [getItem]: {
    next(state, { payload }) {
      const { rfc, count, subProcessesItems } = payload;
      return {
        ...state,
        rfc,
        count,
        subProcessesItems,
      };
    },
  },
  [makeSetIncomePage]: (state, { payload }) => ({ ...state, page: payload }),
  [onSuccess(getRfcIncomeItemSubProcessItems)]: (state, { payload }) => {
    const { subProcessesItems } = state;
    const { subProcessId, items } = payload;

    return {
      ...state,
      subProcessesItems: {
        ...subProcessesItems,
        [subProcessId]: items,
      },
    };
  },
  [resetFetchState]: handlePayload('fetchState'),
}, initialState);

export default withFetchFlow(
  getItemFlow,
)(reducer);
