import urljoin from 'url-join';
import APIService from './APIService.js';

export default class ApiServiceFactory {

  constructor(options) {
    this._apiUrl = options.apiUrl || null;
    this._headers = options.headers || null;
    this._credentials = options.credentials || 'omit';
    this._responseHandler = options.responseHandler || null;
  }

  setApiUrl(url) {
    if (typeof this._apiUrl === 'string') {
      throw new Error('You can not change API url');
    }
    this._apiUrl = url;
    return this;
  }

  createApiServiceAdapter = (path, options) =>
    new APIService(
      urljoin(this._apiUrl, path),
      options,
      {
        headers: this._headers,
        credentials: this._credentials,
      },
      this._responseHandler
    );

}
