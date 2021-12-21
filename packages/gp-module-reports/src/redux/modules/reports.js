import {
  ReportService,
  PackageControlService,
} from '@gostgroup/gp-api-services/lib/services';
import { handleActions } from 'redux-actions';

const LIST = 'gp-core/lib/reports/list';
const LIST_REPORT_INIT = 'gp-core/lib/reports/initList';
const GET_BY_UUID = 'gp-core/lib/reports/get';

const initialState = {
  results: [],
  selectedReport: null,
};

export function getReports(promise) {
  return (dispatch) => {
    dispatch({
      type: LIST_REPORT_INIT,
    });
    promise.then((payload) => {
      dispatch({
        type: LIST,
        payload,
      });
    });
  };
}

export function getReportOperations({ dateStart, dateEnd, status }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  if (status) {
    payload.status = status;
  }

  return getReports(ReportService.path('by-date-and-status').get(payload));
}

export function getReportSecurity({ dateStart, dateEnd, status }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  if (status) {
    payload.status = status;
  }

  return getReports(ReportService.path('penetration-log').get(payload));
}

export function getReportImport({ dateStart, dateEnd, status }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  if (status) {
    payload.status = status;
  }
  return getReports(ReportService.path('by-date-and-status-import').get(payload));
}

export function getReportUser({ dateStart, dateEnd }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  return getReports(ReportService.path('by-date-user').get(payload));
}

export function getReportExpert({ dateStart, dateEnd }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  return getReports(ReportService.path('by-date-expert').get(payload));
}

export function getReportUserLog({ dateStart, dateEnd, login }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  if (login) {
    payload.login = login;
  }
  return getReports(ReportService.path('user-log').get(payload));
}

export function getReportUserComments({ dateStart, dateEnd, user, element }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  if (user) {
    payload.user = user;
  }
  if (element) {
    payload.element = element;
  }
  return getReports(ReportService.path('user-comments').get(payload));
}

export function getRestoreRfcReport({ dateStart, dateEnd }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  return getReports(ReportService.path('by-date-restore').get(payload));
}

export function getReportQuality({ dateStart, dateEnd }) {
  const payload = {
    dateStart,
    dateEnd,
  };
  return getReports(PackageControlService.path('results').get(payload));
}

export default handleActions({
  [LIST]: {
    next(state, { payload }) {
      if (Array.isArray(payload)) {
        return {
          ...state,
          results: payload,
        };
      }
      return state;
    },
  },
  [GET_BY_UUID]: {
    next(state, { payload }) {
      return {
        ...state,
        selectedReport: payload,
      };
    },
  },
}, initialState);
