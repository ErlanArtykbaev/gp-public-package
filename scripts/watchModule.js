const path = require('path');
const argv = require('yargs').argv;
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const getConfig = require('./webpack/webpack.config.dev');
const getDevServerConfig = require('./webpack/webpack.server');
const colors = require('colors');
const watch = require('./babel-scripts').watch;
const dotenv = require('dotenv-safe');
const commonEnv = require('./commonEnv');

const packagesPath = path.resolve(__dirname, '..', 'packages');
const getModulePath = module => path.resolve(packagesPath, module);
const moduleName = argv.module || 'gp-app';
const modulePath = getModulePath(moduleName);

/**
 * Закомментировал временно чтобы запускать gp-app
 */
const dotenvConfig = dotenv.load({
  path: path.resolve(modulePath, '.env'),
  sample: path.resolve(modulePath, '.env.example'),
}).parsed;

/**
 * NOTE
 * При пробрасывании в proccess.env webpack нужно сначала сделать stringify всех полей объекта
 */
const env = Object.keys(dotenvConfig).reduce((result, key) => {
  result[key] = (dotenvConfig[key]);
  return result;
}, {});

const appConfig = commonEnv(env);

function run() {
  const config = getConfig({
    entry: modulePath,
    appConfig,
    // env,
  });
  const compiler = webpack(config);
  const options = getDevServerConfig({
    publicPath: config.output.publicPath,
    contentBase: modulePath,
    proxy: {
      [`${appConfig.apiPath}/*`]: {
        changeOrigin: true,
        target: `${appConfig.apiProto}://${appConfig.apiHost}`,
        secure: false,
      },
    },
  });

  console.log(colors.green(`Serving from: ${options.contentBase}`));

  const server = new WebpackDevServer(compiler, options);
  server.listen(appConfig.port, appConfig.host, (err) => {
    if (err) {
      return err;
    }
    console.log(`webpack-dev-server is running on http://localhost:${appConfig.port}`.green);
    watch(['packages']);
  });
}

run();
