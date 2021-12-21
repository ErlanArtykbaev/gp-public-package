import { REDUCER_KEY, reducer } from './redux';

export default function createRoute({ store }) {
  return {
    path: 'map',
    getComponent(nextState, callback) {
      require.ensure([], (require) => {
        store.injectReducer({ [REDUCER_KEY]: reducer });
        callback(null, require('@gostgroup/gp-core/lib/modules/map').default);
      }, 'map');
    },
  };
}
