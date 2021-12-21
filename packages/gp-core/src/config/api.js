const DEFAULT_API_URL = '/rest';
const DEFAULT_SOCKET_PROTO = 'ws';
const DEFAULT_SOCKET_URL = `${DEFAULT_SOCKET_PROTO}://${window.location.host}`;

export function getApiUrl() {
  try {
    if (process.env.APIHOST) {
      return `${process.env.APIPROTO || 'http'}://${process.env.APIHOST}/rest`;
    }
  } catch (e) {
    console.warn(`Error on Core API Url initialization, using '${DEFAULT_API_URL}' as API Url`); // eslint-disable-line no-console
    console.error(e); // eslint-disable-line no-console
  }
  return DEFAULT_API_URL;
}

export function getSocketUrl() {
  try {
    if (process.env.SOCKETHOST) {
      return `${process.env.SOCKETPROTO || 'ws'}://${process.env.SOCKETHOST}`;
    }
  } catch (e) {
    console.warn(`Error on Core Socket Url initialization, using '${DEFAULT_SOCKET_URL}' as Socket Url`); // eslint-disable-line no-console
    console.error(e); // eslint-disable-line no-console
  }
  return DEFAULT_SOCKET_URL;
}
