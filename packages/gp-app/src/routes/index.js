import get from 'lodash/get';

export default function getRoutes(RootComponent, options) {
  return {
    path: '/',
    component: RootComponent,
    onChange: RootComponent.onChange,
    onEnter: RootComponent.onEnter,
    getChildRoutes(partialNextState, callback) {
      require.ensure([], (require) => {
        callback(null, [
          require('./login').default(options),
          require('./content').default(options),
          ...(get(options, 'getChildRoutes.index', () => [])(options)),
        ]);
      });
    },
  };
}
