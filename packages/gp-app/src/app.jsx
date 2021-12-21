import React from 'react';
import DocumentTitle from 'react-document-title';
import get from 'lodash/get';
import { render } from 'react-dom';
import { Router } from 'react-router';
import { applyMiddleware as applyWebsocketServiceFactoryMiddleware } from '@gostgroup/gp-api/lib/ws/WebsocketServiceFactory';
import '@gostgroup/gp-core/lib/globals';
import StoreProvider from '@gostgroup/gp-core/lib/components/StoreProvider';
import createStore from '@gostgroup/gp-core/lib/redux/createStore';
import { createHistory } from '@gostgroup/gp-core/lib/routes';
import getRoutes from './routes';
import reducer from './redux/modules/reducer';
import appConfig from './config.js';
import AppHandler from './AppHandler';
import '@gostgroup/gp-core/lib/assets/styles/app/redesign.global.scss';

window.React = React;
const store = createStore(reducer);
const getSession = () => store.getState().core.session;
applyWebsocketServiceFactoryMiddleware(() => {
  const state = store.getState();
  return {
    token: get(state, 'core.session.currentUser.token'),
  };
});

console.info('app configuration', appConfig);

const routes = getRoutes(
  AppHandler,
  {
    index: appConfig.indexRoute,
    getSession,
    store,
  },
);

render(
  <DocumentTitle title={appConfig.title}>
    <StoreProvider store={store}>
      <Router
        history={createHistory(store)}
        routes={routes}
      />
    </StoreProvider>
  </DocumentTitle>,
  document.getElementById('container')
);
