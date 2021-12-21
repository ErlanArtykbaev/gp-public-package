import { handleActions } from 'redux-actions';
import {
  RfcCodingTableService,
  RfcCodingTableItemsService,
} from '@gostgroup/gp-api-services/lib/services';

const GET_TABLES = 'gp-core/lib/rfc/codingTables/getTables';
const GET_TABLES_ITEMS = 'gp-core/lib/rfc/codingTables/getTablesItems';

const initialState = {
  tables: [],
};

export default handleActions({
  [GET_TABLES]: {
    next(state, { payload }) {
      return {
        ...state,
        tables: payload,
      };
    },
  },
  [GET_TABLES_ITEMS]: {
    next(state, { payload }) {
      return {
        ...state,
        items: payload,
      };
    },
  },
}, initialState);

export function getCodingTables() {
  return {
    type: GET_TABLES,
    payload: RfcCodingTableService.get(),
  };
}

export function getCodingTablesItems(data) {
  const { absPath, extSysId, perPage = 10 } = data;
  return {
    type: GET_TABLES_ITEMS,
    payload: RfcCodingTableItemsService.get({ absPath, extSysId, perPage }),
  };
}
