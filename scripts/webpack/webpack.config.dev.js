var path = require('path');
var webpack = require('webpack');
// var appConfig = require('./config.js');
// var host = appConfig.host;
// var port = appConfig.port;
var sharedConfig = require('./webpack.config.shared.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
var colors = require('colors');

function getConfig(opts) {
  console.log(colors.green(`context: ${opts.entry}`));
  console.log(colors.green(`Build path: ${path.resolve(opts.entry, 'dist')}`));

  const definitions = Object.assign({}, sharedConfig.definitions, {
    'process.env': Object.assign(sharedConfig.definitions['process.env'], opts.env),
  });

  return {
    devtool: 'eval',
    context: opts.entry,
    entry: {
      'app': [
        'webpack-dev-server/client?http://' + opts.appConfig.host + ':' + opts.appConfig.port,
        'webpack/hot/only-dev-server',
        "./src/index.js",
      ]
    },
    output: {
      path: path.resolve(opts.entry, 'dist'),
      publicPath: '/dist/',
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
    },
    module: {
      rules: [
        ...sharedConfig.module.rules,
        { test: /\.jsx?$/, exclude: /node_modules/, use: ['babel-loader?cacheDirectory'] },
        {
          test: /\.global\.s?css$/,  // // only files with .global will go through this loader. e.g. app.global.s?css
          use: [
            'style-loader',
            'css-loader',
            'resolve-url-loader',
            'sass-loader?sourceMap'
          ]
        },
        {
          test: /^((?!\.global).)*\.s?css$/,  // anything with .global will not go through css modules loader
          use: [
            'style-loader',
            'css-loader?sourceMap&modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
            'resolve-url-loader',
            'sass-loader?sourceMap'
          ]
        }
      ],
      // noParse: [
      //   /object-hash\/dist\/object_hash.js/,
      // ],
    },
    resolve: sharedConfig.resolve,
    plugins: [
      ...sharedConfig.plugins,
      new webpack.DefinePlugin(definitions),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      // new HtmlWebpackPlugin()
      // new ProgressBarPlugin({ clear: false })
    ],
  };
}

module.exports = getConfig;
