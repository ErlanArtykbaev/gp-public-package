import { handleActions, createAction } from 'redux-actions';
import {
  SearchService,
} from '@gostgroup/gp-api-services/lib/services';
import constFactory from '@gostgroup/gp-redux-utils/lib/constFactory';

const PATH = 'gp-core/lib/search/';
const createConst = constFactory(PATH);

const initialState = {
  items: [],
  isSearching: false,
  page: 0,
  count: 0,
};

export const initSearch = createAction(createConst('initSearch'));
export const searchSuccess = createAction(createConst('searchSuccess'));
export const searchFail = createAction(createConst('searchFail'));
export const setPage = createAction(createConst('setPage'));

export function search(query, page = 0) {
  return (dispatch) => {
    dispatch(initSearch(query));
    const payload = {
      page: page + 1,
      perPage: 10,
    };
    return SearchService.path('all', query).get(payload)
      .then(r => dispatch(searchSuccess(r)))
      .catch(r => dispatch(searchFail(r)));
  };
}

export default handleActions({
  [initSearch]: {
    next(state, { payload }) {
      const query = payload;
      let { page } = state;
      if (state.query && query !== state.query) {
        page = 0;
      }
      return {
        ...state,
        query,
        page,
        isSearching: true,
      };
    },
  },
  [searchSuccess]: {
    next(state, { payload }) {
      const { items, count } = payload;
      return {
        ...state,
        items,
        count,
        isSearching: false,
      };
    },
  },
  [searchFail]: state => ({ ...state, isSearching: false }),
  [setPage]: (state, { payload }) => ({ ...state, page: payload }),
}, initialState);
