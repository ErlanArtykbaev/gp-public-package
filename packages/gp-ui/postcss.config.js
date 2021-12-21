const colors = require('./vars.default');

module.exports = {
  parser: 'postcss-scss',
  plugins: {
    'postcss-import': {},
    'postcss-simple-vars': { variables: colors }
  }
}
