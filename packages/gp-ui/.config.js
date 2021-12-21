const path = require('path')

const production = process.env.NODE_ENV === 'production'
const output = path.join(__dirname, 'dist/')
const devtool = production ? '' : 'source-map'

module.exports = {
  config: {
    output,
    devtool,
    production,
  },
}
