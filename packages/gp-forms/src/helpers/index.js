function concat(...arrays) {
  return arrays.filter(a => !!a).reduce((acc, arr = []) => acc.concat(arr), []);
}

function mergeListConfig(listConfig, typeConfig) {
  const newConfig = Object.assign({}, listConfig, { typeConfig });
  newConfig.config = Object.assign({}, newConfig.config,
    { customValidations: concat(typeConfig.config.customValidations, listConfig.config.customValidations) });
  return newConfig;
}

function mergeObjectConfig(rowConfig, typeConfig) {
  const { id, title } = rowConfig;
  let newConfig = rowConfig;

  if (typeConfig) {
    newConfig = Object.assign({}, typeConfig, { id, title });
    newConfig.config = Object.assign({}, rowConfig.config, newConfig.config,
      { customValidations: concat(typeConfig.config.customValidations, rowConfig.config.customValidations) });
  }

  return newConfig;
}

function getRowConfig(config, rowConfig) {
  if (rowConfig.type === 'list' || rowConfig.type === 'table') {
    const externalType = (config.types || []).find(type => type.id === (rowConfig.config.key || rowConfig.config.type));
    if (externalType && externalType.types === undefined) {
      externalType.types = config.types;
    }
    return mergeListConfig(rowConfig, externalType);
  }
  const externalType = (config.types || []).find(type => type.id === rowConfig.type);
  if (externalType && externalType.types === undefined) {
    externalType.types = config.types;
  }
  return mergeObjectConfig(rowConfig, externalType);
}

function unwrapProperties(config) {
  return config.config.properties
    .map(row => getRowConfig(config, row));
}

export {
  getRowConfig,
  unwrapProperties,
};
