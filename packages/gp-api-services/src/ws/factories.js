import WebsocketServiceFactory from '@gostgroup/gp-api/lib/ws/WebsocketServiceFactory';
import { getSocketUrl } from '../config';

export const CORE_WEBSOCKET_FACTORY = new WebsocketServiceFactory(getSocketUrl(), {
  automaticOpen: false,
}, {
  params({ token }) {
    return {
      token,
    };
  },
});
