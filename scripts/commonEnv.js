/*
 * App configuration
 */

// TODO add configuration for proxy usage
// NOTE maybe we should use boolean 'secure' config instead of protocol strings
module.exports = env => ({
  host: env.HOST || 'localhost', // local server host
  port: env.PORT || 8081, // local server port
  apiProto: env.APIPROTO || 'http', // api server (proxy) protocol
  apiHost: env.APIHOST || 'localhost', // core api server (proxy) host
  apiPort: env.APIPORT || 80, // core api server (proxy) port
  apiPath: '/rest', // core api path (apiurl = host:port/path),

  proxyPath: '/rest/*',
  proxyProtocol: 'http',
  proxyHost: '',
  proxyPort: '',

  socketProto: env.SOCKETPROTO || 'ws', // core socket interface protocol
  socketHost: env.SOCKETHOST || env.APIHOST || 'localhost', // core socket interface host
  socketPort: env.SOCKETPORT, // core socket interface port
  useProxy: true,
});
