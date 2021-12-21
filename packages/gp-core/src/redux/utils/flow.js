import get from 'lodash/get';
import some from 'lodash/some';
import memoize from 'lodash/memoize';
import { createSelector } from 'reselect';
import reduceReducers from './reduceReducers';
import { handleActions } from './actions';

export const INIT = 'INIT';
export const SUCCESS = 'SUCCESS';
export const ERROR = 'ERROR';

export const IS_FETCHING = 'IS_FETCHING';

function actionTypeDecorator(string) {
  return actionType => `${actionType}_${string}`;
}
/**
 * @param {string} actionType - action type string
 * @return {string} actionInitType - string which represents type of action on some stage of the actions flow
 */
export const onInit = actionTypeDecorator(INIT);
export const onSuccess = actionTypeDecorator(SUCCESS);
export const onError = actionTypeDecorator(ERROR);

export const isFetchingReducer = (actionType, path = 'fetchState') =>
  state => ({
    ...state,
    [path]: Object.assign({}, {
      ...state[path],
      [actionType]: get(state, [path, actionType], 0) + 1,
    }),
  });

export const isNotFetchingReducer = (actionType, path = 'fetchState') =>
  state => ({
    ...state,
    [path]: Object.assign({}, {
      ...state[path],
      [actionType]: Math.max(get(state, [path, actionType], 0) - 1, 0),
    }),
  });

export const fetchStateFlow = type => ({
  [onInit(type)]: isFetchingReducer(type),
  [onError(type)]: isNotFetchingReducer(type),
  [onSuccess(type)]: isNotFetchingReducer(type),
});

/**
 * Короче бля, схема такая.
 * Принимает на вход набор типов экшнов (как в обычном ридаксе, все как в жизни)
 * Идет по этим типам и составляет объект со значениями вида ТИП: редуксер
 * При этом для каждого типа составляет 3 вида редуксеров по 3 типам:
 * ТИП_INIT: reducer
 * ТИП_SUCCESS: reducer
 * ТИП_ERROR: reducer
 * Каждый из этих редьюсеров это результат выполнения isFetchingReducer или isNotFetchingReducer
 * Таким образом мы получаем для каждого переданного типа объект, который содержит 3 типа и 3 редьюсера
 * которые изменяют стейт, апдейтив в них состояние фетча на true или false
 * далее это синхронизируется с основным редьюсером путем reduceReducers для избежания конфликтов
 */
export const withFetchFlow = (...types) => (reducer) => {
  const handlers = types.reduce((p, c) => Object.assign({}, p, fetchStateFlow(c)), {});
  const fetchFlowReducer = handleActions(handlers);
  return reduceReducers(fetchFlowReducer, reducer);
};

const filter = el => !!el;
export const makeGetLoadingState = (module, stateKey = 'core', actionKey = 'core') => (state, ...keys) => {
  const fetchState = get(state, [stateKey, ...module.split('/'), 'fetchState'].filter(filter), {});
  return some(keys || [], key => !!fetchState[[actionKey, module, key].filter(filter).join('/')]);
};
// TODO вот реализация с createSelector и мемоизацией, но она требует изменения всех вызовов на getLoadingState(state)(keys)
// export const makeGetLoadingState = (module, stateKey = 'core', actionKey = 'core') => createSelector(
//   state => get(state, [stateKey, ...module.split('/'), 'fetchState'].filter(filter)),
//   fetchState => memoize(
//     (...keys) => some(keys || [], key => !!get(fetchState, [actionKey, module, key].filter(filter).join('/')))
//   )
// );
