import Content from '../components/Content';

export default function getRoutes(options) {
  return {
    name: 'content',
    component: Content,
    onEnter: Content.onEnter.bind(null, options.getSession),
    getChildRoutes(partialNextState, callback) {
      require.ensure([], (require) => {
        callback(null, [
          require('./objects').default(options),
          require('./reports').default(options),
          require('./rfc').default(options),
          require('./graph').default(options),
          require('./unsubscribe').default(options),
          require('./packControl').default(options),
          require('./permissionError').default(options),
        ]);
      }, 'content');
    },
  };
}
