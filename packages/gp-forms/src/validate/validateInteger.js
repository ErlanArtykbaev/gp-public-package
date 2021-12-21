const validateIntegerResult = {
  min: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть не менее ${config.config.min}`,
    },
  },
  max: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть не более ${config.config.max}`,
    },
  },
  required: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть заполнено`,
    },
  },
  integer: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть числом`,
    },
  },
  regexp: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Введенное значение не соответствует регулярному выражению${config.config.test ? `, пример: "${config.config.test}"` : ''}`,
    },
  },
};

export const validators = [
  {
    name: 'min',
    validator(config, data = '') {
      const parsedData = parseInt(data, 10);

      return parsedData < config.config.min ? validateIntegerResult.min.fail : validateIntegerResult.min.passed;
    },
  },
  {
    name: 'max',
    validator(config, data = '') {
      const parsedData = parseInt(data, 10);

      return parsedData > config.config.max ? validateIntegerResult.max.fail : validateIntegerResult.max.passed;
    },
  },
];

export const fixedValidators = [
  {
    name: 'required',
    validator(config, data) {
      return config.required && !data && data !== 0 ? validateIntegerResult.required.fail : validateIntegerResult.required.passed;
    },
  },
  {
    name: 'integer',
    validator(config, data) {
      if (!data && data !== 0) {
        return validateIntegerResult.integer.passed;
      }
      return typeof data === 'number' && parseInt(data, 10) !== data || !/^-?\d*$/.test(data) ? validateIntegerResult.integer.fail : validateIntegerResult.integer.passed;
    },
  },
  {
    name: 'regexp',
    validator: function validator(config, data) {
      if (typeof data !== 'undefined' && config.config.isRegexpRequired) {
        const re = new RegExp(config.config.regexp);

        return !re.test(data) ? validateIntegerResult.regexp.fail : validateIntegerResult.regexp.passed;
      }
      return validateIntegerResult.regexp.passed;
    },
  },
];
