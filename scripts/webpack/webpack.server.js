module.exports = (configExtender) => ({
  quiet: false,
  hot: true,
  inline: true,
  lazy: false,
  stats: {
    assets: true,
    colors: true,
    chunks: false,
    chunkModules: false,
    env: true,
    modules: false,
  },
  ...configExtender,
});
