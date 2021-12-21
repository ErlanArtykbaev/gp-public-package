const path = require('path')
const webpack = require('webpack')
const BabiliPlugin = require('babili-webpack-plugin')

const { config } = require('./.config')

const pluginList = [
  new webpack.DllPlugin({
    name: 'vendor',
    path: path.resolve(__dirname, 'dist/manifest.json'),
  }),
]

if (config.production) {
  pluginList.push(new BabiliPlugin())
  pluginList.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  )
}

module.exports = {
  entry: ['react', 'react-dom', 'react-router', 'antd'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vendor.js',
    library: 'vendor',
  },
  plugins: pluginList,
}
