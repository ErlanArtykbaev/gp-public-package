import Content from '@gostgroup/gp-core/lib/components/Content';

export default function getRoutes(options) {
  return {
    name: 'content',
    component: Content,
    onEnter: Content.onEnter.bind(null, options.getSession),
    getChildRoutes(partialNextState, callback) {
      require.ensure([], (require) => {
        callback(null, [
          require('@gostgroup/gp-core/lib/routes/objects').default(options),
          require('@gostgroup/gp-core/lib/routes/reports').default(options),
          require('@gostgroup/gp-core/lib/routes/rfc').default(options),
          require('@gostgroup/gp-core/lib/routes/graph').default(options),
          require('@gostgroup/gp-core/lib/routes/unsubscribe').default(options),
          require('@gostgroup/gp-core/lib/routes/packControl').default(options),
          require('@gostgroup/gp-core/lib/routes/permissionError').default(options),
          require('./refImport').default(options),
        ]);
      }, 'content');
    },
  };
}
