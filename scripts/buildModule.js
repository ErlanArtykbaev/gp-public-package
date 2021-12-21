const path = require('path');
const argv = require('yargs').argv;
const colors = require('colors');
const commonEnv = require('./commonEnv');
const getConfig = require('./webpack/webpack.config.prod');
const webpack = require('webpack');

const packagesPath = path.resolve(__dirname, '..', 'packages');
const getModulePath = module => path.resolve(packagesPath, module);
const moduleName = argv.module || 'gp-app';
const modulePath = getModulePath(moduleName);

console.log(colors.green(`module-path: ${modulePath}`));

const appConfig = commonEnv({
  PORT: 80,
});

const config = getConfig({
  entry: modulePath,
  appConfig,
});

const compiler = webpack(config);

compiler.run(() => {});
