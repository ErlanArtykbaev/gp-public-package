import 'isomorphic-fetch';
import urljoin from 'url-join';
import objectToQueryString from '@gostgroup/gp-utils/lib/objectToQueryString';

const clientErrorCodeRegEx = /^[4][0-9][0-9]$/;
const serverErrorCodeRegEx = /^[5][0-9][0-9]$/;
const isClientError = code => clientErrorCodeRegEx.test(code);
const isServerError = code => serverErrorCodeRegEx.test(code);

class HTTPError extends Error {
  constructor(props) {
    super(props);
    this.name = 'HttpError';
  }
}

class RequestBody {
  static json = data => JSON.stringify(data)
  static formData = data => Object.keys(data).reduce(
    (p, c) => { p.append(c, data[c]); return p; }, new FormData()
  );
}

const DEFAULT_DATA_TYPES = {
  request: 'json',
  response: 'json',
};

/**
 * @todo add configuration for processResponse function
 * @example processResponse(response: Map): any
 */

export default class APIService {

  /**
   * Creates adapter for backend service via provided url
   * @param {string} url - url path
   * @param {Object} options - options
   * @param {Function} options.onRequestInit // TODO implement
   * @param {Function} options.onResponseReceived // TODO implement
   * @param {Function} options.logFunction
   * @param {Function} options.handleErrorResponse
   * @param {Function} options.handleSuccessResponse
   * @param {Object} fetchOptions - fetch api options
   */
  constructor(url, options = { dataTypes: { ...DEFAULT_DATA_TYPES } }, fetchOptions = { headers: {} }, responseHandler) {
    this.options = options;
    this.fetchOptions = fetchOptions;
    this.url = url;
    this.responseHandler = responseHandler;
    this.serviceName = url.replace(/\//g, '');
    this.logFunction = options.logFunction || (() => {});
  }

  processResponse = (r) => {
    if (r && r.warnings && r.warnings.length) {
    // Show warnings
      if (Array.isArray(r.warnings)) {
        r.warnings.map(w => this.warningNotificationFunction(w));
      } else if (typeof r.warnings === 'string') {
        this.warningNotificationFunction(r.warnings);
      }
      throw new Error('Request warnings is not empty!');
    }
    return r;
  }

  checkResponse(url, response, body) {
    if (isServerError(response.status)) {
      throw new Error('Server error');
    } else if (body && body.errors && body.errors.length) {
      body.errors.forEach((er) => {
        console.error(er); // eslint-disable-line no-console
      });
      throw new Error('Errors in response body');
    }
  }

  httpMethod(params = {}, body = {}, method) {
    this.log(method);
    let url = this.url;
    const options = {
      method,
      ...this.fetchOptions,
    };
    const requestDataType = this.options.dataTypes.request;
    const responseDataType = this.options.dataTypes.response;

    const { handleErrorResponse, handleSuccessResponse } = this.options;

    if (['POST', 'PUT', 'DELETE'].indexOf(method) > -1) {
      options.body = RequestBody[requestDataType](body);
    }
    url = `${url}?${objectToQueryString(params)}`;

    return fetch(url, options).then((r) => {
      if (this.responseHandler && typeof this.responseHandler === 'function') {
        this.responseHandler(r, false);
      }

      if (isClientError(r.status)) {
        return Promise.reject(new HTTPError(r.status));
      }

      return r[responseDataType]()
        .then((responseBody) => {
          if (typeof handleSuccessResponse === 'function') {
            return handleSuccessResponse(url, r, responseBody);
          }

          this.checkResponse(url, r, responseBody);
          if (this.options.withHeaders) {
            return Promise.resolve({
              data: responseBody,
              headers: (this.options.responseHeaders || []).reduce(
                (p, c) => {
                  p[c] = r.headers.get(c);
                  return p;
                }, {}),
            });
          }
          return Promise.resolve(responseBody);
        })
        .catch((ex) => {
          if (typeof handleErrorResponse === 'function') {
            return handleErrorResponse(url, r, null);
          }

          console.error(`Exception on parsing data fetched from ${url}`, ex); // eslint-disable-line no-console
          this.checkResponse(url, r, null);
          if (method === 'GET') {
            return Promise.reject();
          }
          return Promise.resolve();
        });
    }).catch((e) => {
      if (this.responseHandler && typeof this.responseHandler === 'function') {
        this.responseHandler(e, true);
      }
      return Promise.reject(e);
    });
  }

  get = (params = {}) => this.httpMethod(params, null, 'GET');

  post(body = {}, params = {}) {
    return this.httpMethod(params, body, 'POST').then(r => this.processResponse(r));
  }

  put(body = {}, params = {}) {
    return this.httpMethod(params, body, 'PUT').then(r => this.processResponse(r));
  }

  delete(body = {}, params = {}) {
    return this.httpMethod(params, body, 'DELETE').then(r => this.processResponse(r));
  }

  path(...args) {
    const url = urljoin(this.url, ...args);
    return new APIService(url, this.options, this.fetchOptions, this.responseHandler);
  }

  dataTypes(dataTypesObject) {
    return new APIService(
      this.url,
      {
        ...this.options,
        dataTypes: { ...this.options.dataTypes, ...dataTypesObject },
      },
      this.fetchOptions
    );
  }

  withHeaders(...headers) {
    return new APIService(
      this.url,
      {
        ...this.options,
        withHeaders: true,
        responseHeaders: headers,
      },
      this.fetchOptions,
    );
  }

  withRequestHeaders(headers = {}) {
    return new APIService(
      this.url,
      this.options,
      {
        ...this.fetchOptions,
        headers: {
          ...this.fetchOptions.headers,
          ...headers,
        },
      }
    );
  }

  log(method) {
    this.logFunction(method);
  }

}
