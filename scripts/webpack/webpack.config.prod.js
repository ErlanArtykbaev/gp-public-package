if (process.env.USE_ENV_BUILD) {
  require('dotenv-safe').config();
}

var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
// var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var notifyStats = require('./utils/notifyStats');
// var versionUtils = require('./utils/version.js');
// var appConfig = require('./config.js');
var sharedConfig = require('./webpack.config.shared.js');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var plugins = [
  ...sharedConfig.plugins
];

var sharedDefinitions = sharedConfig.definitions;

// if (process.env.USE_ENV_BUILD) {
//   sharedDefinitions['process.env'] = Object.assign({},
//     sharedDefinitions['process.env'],
//     {
//       APIHOST: JSON.stringify(appConfig.apiHost),
//       APIPROTO: JSON.stringify(appConfig.apiProto),
//     }
//   );
// }

if (process.env.ANALYZE) {
  plugins.push(new BundleAnalyzerPlugin());
}

function getConfig(opts) {
  const definitions = {
    'process.env': Object.assign({}, sharedDefinitions['process.env'], {
      NODE_ENV: JSON.stringify('production'),
      // APIHOST: opts.appConfig.apiHost,
      // APIPORT: opts.appConfig.apiPort,
      // APIPROTO: opts.appConfig.apiProto,
      // SOCKETHOST: opts.appConfig.socketHost,
    })
  };


  return {
    devtool: 'source-map',
    context: opts.entry || sharedConfig.context,
    entry: {
      'app': [
        "./src/index.js",
      ]
    },
    output: {
      path: path.join(__dirname, '..', '..', 'dist'),
      filename: '[name].[hash].js',
      chunkFilename: '[name].chunk.[chunkHash].js',
      /* если оставить publicPath то HtmlWebpackPlugin будет вставлять скрипты со ссылкой на него
      * а нам это не нужно т.к. index.html генерится в dist
      */
      // publicPath: '/dist/',
    },
    module: {
      rules: [
        ...sharedConfig.module.rules,
        { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
        {
          test: /\.global\.s?css$/, // only files with .global will go through this loader. e.g. app.global.s?css
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader?sourceMap&minimize', 'resolve-url-loader', 'sass-loader?sourceMap'],
            publicPath: '/' // Prepends 'url' paths in CSS output files
          })
        },
        {
          test: /^((?!\.global).)*\.s?css$/,  // anything with .global will not go through css modules loader
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader?sourceMap&modules&minimize&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]','resolve-url-loader','sass-loader?sourceMap'],
            publicPath: '/' // Prepends 'url' paths in CSS output files
          })
        }
      ]
    },
    resolve: sharedConfig.resolve,
    plugins: [
      ...plugins,
      new webpack.DefinePlugin(definitions),
      new CleanPlugin(['dist'], {
        root: path.resolve(__dirname, '..', '..')
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            warnings: true
          }
        }
      }),
      new ExtractTextPlugin({
        filename: 'css/[name].[contenthash].css',
        disable: false,
        allChunks: true,
      }),
      new HtmlWebpackPlugin({
        title: 'GOST НСИ',
        template: path.resolve(__dirname, 'templates', 'index.hbs'),
      }),
      function onDone() {
        this.plugin('done', notifyStats);
      },
    ]
  };
}

module.exports = getConfig;
