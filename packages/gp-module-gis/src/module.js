import config from './config';
import transforms from './redux/transforms';

const KEY = 'map';

export default configEnhancer => ({
  key: KEY,
  config: { ...config, ...configEnhancer(config) },
  redux: {
    transforms,
  },
});
