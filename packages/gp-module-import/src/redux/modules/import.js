import {
  ProcessImportService,
  ItemTitlesService,
  KettleService,
  ProcessesImportService,
} from '@gostgroup/gp-api-services/lib/services';
import get from 'lodash/get';
import { handleActions } from 'redux-actions';
import { unknownError } from '@gostgroup/gp-core/lib/redux/sideeffects/errors';

function formatInterval(interval) {
  if (interval >= 604800000) {
    return `${Number(interval / 604800000).toFixed(1)} нед.`;
  } else if (interval >= 86400000) {
    return `${Number(interval / 86400000).toFixed(1)} д.`;
  } else if (interval >= 3600000) {
    return `${Number(interval / 3600000).toFixed(1)} ч.`;
  }
  return '';
}

function addInterval(items) {
  return (items || []).map((i) => { i.formattedInterval = formatInterval(i.interval); return i; });
}

const GET_EXTERNAL_SYSTEMS = 'gp-core/lib/import/getExternalSystems';
const GET_PROCESS_IMPORT_MAP = 'gp-core/lib/import/getProcessImportMap';
const GET_TRANSFORMATIONS = 'gp-core/lib/import/getTransformations';
const GET_TRANSFORMATION = 'gp-core/lib/import/getTransformationById';
const GET_IMPORT_TASKS = 'gp-core/lib/import/getImportTasks';
const GET_IMPORT_PROCESSES = 'gp-core/lib/import/getImportProcesses';

const initialState = {
  externalSystems: [],
  transformations: [],
  selectedTransformation: null,
  settings: [],
  tasks: [],
  processes_import: null,
};

const importStatuses = {
  fail: 'Ошибка при выполнении',
  success: 'Выполнено успешно',
  process: 'В обработке',
};

/* Actions */

export function getExternalSystems() {
  // TODO попросить бек сделать отдельный сервис!
  return {
    type: GET_EXTERNAL_SYSTEMS,
    payload: ItemTitlesService.path('nsi/tech/external_systems').get(),
  };
}

export function getProcessImportMap() {
  return {
    type: GET_PROCESS_IMPORT_MAP,
    payload: ProcessImportService.get(),
  };
}

export function removeProcessImportMapItem(data) {
  return ProcessImportService.delete(data).then(getProcessImportMap);
}

export function postProcessImportMap(data) {
  return ProcessImportService.post(data).then(getProcessImportMap);
}

/* KETTLE */

export function getImportTransformations() {
  return {
    type: GET_TRANSFORMATIONS,
    payload: KettleService.path('ktrs').get(),
  };
}

export function getImportTransformationById(id) {
  return KettleService.path('ktrs', id).get()
    .then(payload => ({
      type: GET_TRANSFORMATION,
      payload,
    }));
}

export function updateImportTransformation(data) {
  return KettleService.path('ktrs').put(data)
    .then(getImportTransformations);
}

export function removeImportTransformation(id) {
  return KettleService.path('ktrs', id).delete()
    .then(getImportTransformations);
}

export function addNewImportTransformation(data) {
  return dispatch => KettleService.path('ktrs').post(data)
    .then((id) => {
      dispatch(getImportTransformations());
      return dispatch(getImportTransformationById(id));
    })
    .catch(() => dispatch(unknownError()));
}

// TODO попросить бек, чтобы возвращался сразу массив или продумать апи лучше
export function getImportTasks(ktrId = '', count = 50, page = 0) {
  const payload = { ktrId, count, page };
  return dispatch => KettleService.path('tasks').get(payload)
    .then(r => dispatch({
      type: GET_IMPORT_TASKS,
      payload: get(r, 'tasks', []),
    }))
    .catch(() => dispatch(unknownError()));
}

export function getProcessesImportList() {
  return {
    type: GET_IMPORT_PROCESSES,
    payload: ProcessesImportService.get(),
  };
}

/* Reducer */

const reducer = handleActions({
  [GET_EXTERNAL_SYSTEMS]: {
    next(state, { payload }) {
      return {
        ...state,
        externalSystems: addInterval(payload),
      };
    },
  },
  [GET_PROCESS_IMPORT_MAP]: {
    next(state, { payload }) {
      return {
        ...state,
        settings: addInterval(payload),
      };
    },
  },
  [GET_TRANSFORMATIONS]: {
    next(state, { payload }) {
      return {
        ...state,
        transformations: addInterval(payload),
      };
    },
  },
  [GET_TRANSFORMATION]: {
    next(state, { payload }) {
      return {
        ...state,
        selectedTransformation: payload,
      };
    },
  },
  [GET_IMPORT_TASKS]: {
    next(state, { payload }) {
      return {
        ...state,
        tasks: (payload || []).map((task) => {
          task.status = importStatuses[task.status];
          task.executedManually = task.executedManually ? 'Да' : 'Нет';
          return task;
        }),
      };
    },
  },
  [GET_IMPORT_PROCESSES]: {
    next(state, { payload }) {
      return {
        ...state,
        processes_import: payload,
      };
    },
  },
}, initialState);

export default reducer;
