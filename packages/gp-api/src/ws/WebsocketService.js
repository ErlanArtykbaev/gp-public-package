import urljoin from 'url-join';
import cloneDeep from 'lodash/cloneDeep';
import objectToQueryString from '@gostgroup/gp-utils/lib/objectToQueryString';
import ReconnectingWebsocket from '../vendor/ReconnectingWebsocket';

const EVENTS = ['data', 'message', 'error', 'close'];
const INITIAL_BOUND_CALLBACKS = EVENTS.reduce((p, c) => { p[c] = []; return p; }, {});

function getInitialBoundCallbacks() {
  return cloneDeep(INITIAL_BOUND_CALLBACKS);
}

function createSocket(url, protocols, options) {
  return new ReconnectingWebsocket(url, protocols, options);
}

function extractParams(params) {
  const finalParams = typeof params === 'function' ? params() : params;
  return { ...finalParams };
}

export default class WebsocketService {

  constructor(url, protocols, options = {}, protocolOptions = {}) {
    this.url = url;
    this.protocols = protocols;
    this.options = options;
    this.protocolOptions = protocolOptions;
    this.boundCallbacks = getInitialBoundCallbacks();
  }

  on(eventKey, callback) {
    if (!EVENTS.includes(eventKey)) {
      throw new Error('No such event');
    }

    if (!this.boundCallbacks[eventKey].includes(callback)) {
      this.boundCallbacks[eventKey].push(callback);
    } else {
      throw new Error('Ei bratan ti 4ego');
    }

    if (eventKey === 'data') {
      // NOTE just sugar for easier data extraction
      this.ws.onmessage = (message) => {
        const { data } = message;
        this.boundCallbacks[eventKey].forEach(c => c(JSON.parse(data)));
      };
    } else {
      this.ws[`on${eventKey}`] = (message) => {
        this.boundCallbacks[eventKey].forEach(c => c((message)));
      };
    }
    return this;
  }

  getParams() {
    return extractParams(this.protocolOptions.params);
  }

  getUrl(path = '') {
    return urljoin(this.url, path, `?${objectToQueryString(this.getParams())}`);
  }

  path(path) {
    return new WebsocketService(urljoin(this.url, path), this.protocols, this.options, this.protocolOptions);
  }

  params(params = {}) {
    const newProtocolOptions = {
      ...this.protocolOptions,
      params: {
        ...this.getParams(),
        ...extractParams(params),
      },
    };
    return new WebsocketService(this.url, this.protocols, this.options, newProtocolOptions);
  }

  resetBoundCallbacks() {
    this.boundCallbacks = getInitialBoundCallbacks();
  }

  open() {
    // if (typeof this.ws !== 'object' || this.ws === null) {
    this.ws = createSocket(this.getUrl(), this.protocols, this.options);
    // }
    console.info(`Open connection to ws ${this.getUrl()}`); // eslint-disable-line no-console
    this.ws.open();
    return this;
  }

  close() {
    if (typeof this.ws === 'object' && this.ws !== null) {
      console.info(`Close connection to ws ${this.getUrl()}`); // eslint-disable-line no-console
      this.resetBoundCallbacks();
      this.ws.close();
    } else {
      console.warn('No ws has been instantinated'); // eslint-disable-line no-console
    }
    return this;
  }
}
