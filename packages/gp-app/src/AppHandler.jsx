import React from 'react';
import App from '@gostgroup/gp-core/lib/components/App';
import { redirectFromRoot } from '@gostgroup/gp-core/lib/routes';
import appConfig from './config.js';

const redirectionFunction = redirectFromRoot(appConfig.indexRoute);

export default function AppHandler(props) {
  return <App {...props} config={appConfig} />;
}

AppHandler.onChange = (prevState, nextState, replace) => {
  redirectionFunction(nextState, replace);
};

AppHandler.onEnter = redirectionFunction;
