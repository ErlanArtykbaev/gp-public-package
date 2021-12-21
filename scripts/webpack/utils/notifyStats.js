function notifyError(error) {
    // BELLs when something goes wrong!
    console.log('🙀');
    console.log("\x07" + error);
  }
  
  function notifyWarning(warning) {
    console.log('👮🏻');
    console.log(warning);
  }
  
  module.exports = function notifyStats(stats) {
    var json = stats.toJson();
    if (json.errors.length > 0) {
      json.errors.forEach(notifyError);
    } else if (json.warnings.length > 0) {
      json.warnings.forEach(notifyWarning);
    } else {
      console.log('Well done! 🎉 🥃');
      console.log(stats.toString({
        chunks: false,
        colors: true
      }));
    }
  };
  