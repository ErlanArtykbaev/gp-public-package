import has from 'lodash/has';

export default (validators, fixedValidators) => (config, value, references = {}) => {
  const validateWith = (_ref) => {
    const validator = _ref.validator;
    const result = validator(config, value, references);

    return result.result ? undefined : result.message(config);
  };

  for (const _ref of fixedValidators) {
    const res = validateWith(_ref);
    if (res) return res;
  }

  for (const _ref of validators) {
    if (has(config.config, _ref.name)) {
      const res = validateWith(_ref);
      if (res) return res;
    }
  }

  return undefined;
};
