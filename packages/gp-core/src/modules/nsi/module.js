import config from './config';

const KEY = 'nsi';

export default (configEnhancer = () => {}) => {
  const result = {
    key: KEY,
    config: { ...config, ...configEnhancer(config) },
  };

  return {
    ...result,
    routes: {
      objects: () => config.elementLikeEntities.map(e => e.route),
    },
  };
};
