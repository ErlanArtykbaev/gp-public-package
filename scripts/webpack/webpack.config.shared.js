var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
// var versionUtils = require('./utils/version.js');
// var appConfig = require('./config.js');

module.exports = {
  context: path.resolve(__dirname, '..'),
  plugins: [
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: process.env.NODE_ENV === 'development',
      __DEVTOOLS__: false
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru/),
  ],
  definitions: {
    'process.env': {
      BROWSER: JSON.stringify('true'),
      SERVER: JSON.stringify('false'),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      // VERSION: JSON.stringify(versionUtils.version),
      // PLATFORM_VERSION: JSON.stringify(versionUtils.platformVersion),
      // SOCKETHOST: JSON.stringify(appConfig.socketHost),
      // SOCKETPORT: JSON.stringify(appConfig.socketPort),
      // SOCKETPROTO: JSON.stringify(appConfig.socketProto),
    }
  },
  module: {
    /**
     * TODO
     * Убрал ts-лоадера exclude: /node_modules/
     * так как пока в папке lib (которая содержит node_modules) у нас есть ts-файлы, которые мы пока компилим
     */
    rules: [
      { test: /\.tsx?$/, use: ['babel-loader', 'ts-loader'] },
      { test: /\.wav$/, use: [ { loader: 'url-loader?limit=1000&name=sounds/[name].[ext]' } ] },
      { test: /\.(jpe?g|png|gif)$/, use: [ { loader: 'url-loader?limit=100000&name=images/[name].[ext]' } ] },
      { test: /\.(eot|woff|woff2|ttf|svg)(\?v=\d+\.\d+\.\d+)?/, use: [ { loader: 'url-loader?limit=100000&name=fonts/[name].[ext]' } ] },
      { test: /\.hbs?$/, use: ['handlebars-loader'] },
    ]
  },
  resolve: {
    modules: [
      path.join(__dirname, "..", "..", "packages"),
      path.join(__dirname, "..", "..", "packages", "gp-app", "node_modules"),
      path.join(__dirname, "..", "..", "packages", "gp-core", "node_modules"),
      path.join(__dirname, "..", "..", "packages", "gp-module-gis", "node_modules"),
      'node_modules'
    ],
    symlinks: false,
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  }
}
