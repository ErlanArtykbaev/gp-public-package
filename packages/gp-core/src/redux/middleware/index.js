import groupMiddleware from './groupMiddleware';
import recordMiddleware from './recordMiddleware';
import notifications from './notificationsMiddleware';
import errorHandlingMiddleware from './errorHandlingMiddleware';
import routesMiddleware from './routesMiddleware';
import connectionMiddleware from './connectionMiddleware';

export default [
  groupMiddleware,
  recordMiddleware,
  notifications,
  errorHandlingMiddleware,
  routesMiddleware,
  connectionMiddleware,
];
