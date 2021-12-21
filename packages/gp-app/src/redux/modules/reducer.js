import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { createCoreReducer } from '@gostgroup/gp-core/lib/redux/modules/reducer.js';
import importReducer from '@gostgroup/gp-module-import/lib/redux';
import graph from '@gostgroup/gp-module-graph/lib/redux';
import packControl from '@gostgroup/gp-module-pack-control/lib/redux';
import reports from '@gostgroup/gp-module-reports/lib/redux';
import search from '@gostgroup/gp-module-search/lib/redux';

export default asyncReducers => combineReducers({
  routing: routerReducer,
  // NOTE здесь добавляются модули, которые мы подключаем в сборку
  // TODO продумать как сделать процесс подключения модуля платформы проще
  // потому что сейчас мы включаем модуль как компонент в routes и его reducer здесь
  core: createCoreReducer({
    import: importReducer,
    graph,
    packControl,
    reports,
    search,
  }),
  ...asyncReducers,
});
