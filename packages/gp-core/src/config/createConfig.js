import merge from 'lodash/merge';
import nsi from 'gp-core/lib/modules/nsi/module';
import get from 'lodash/get';

export default appConfig => ({
  ...appConfig,
  modules: appConfig.modules.reduce((r, m) => ({ ...r, [m.key]: m.config }), {}),
  redux: {
    transforms: appConfig.modules.reduce((r, m) => ([...r, ...get(m, 'redux.transforms', [])]), []),
  },
});
