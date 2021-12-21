// TODO move all validatiors to component-based imports

const validateNumberResult = {
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
  number: {
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
      const parsedData = parseFloat(data);

      return config.config && parsedData < config.config.min ? validateNumberResult.min.fail : validateNumberResult.min.passed;
    },
  },
  {
    name: 'max',
    validator(config, data = '') {
      const parsedData = parseFloat(data);

      return config.config && parsedData > config.config.max ? validateNumberResult.max.fail : validateNumberResult.max.passed;
    },
  },
];

export const fixedValidators = [
  {
    name: 'required',
    validator(config, data) {
      return config.required && !data && data !== 0 ? validateNumberResult.required.fail : validateNumberResult.required.passed;
    },
  },
  {
    name: 'number',
    validator(config, data) {
      if (!data && data !== 0) {
        return validateNumberResult.number.passed;
      }
      return typeof data !== 'number' && !/^[- {2}+]?[0-9]*\.?\,?[0-9]+$/.test(data) ? validateNumberResult.number.fail : validateNumberResult.number.passed;
    },
  }, {
    name: 'regexp',
    validator: function validator(config, data) {
      if (typeof data !== 'undefined' && config.config && config.config.isRegexpRequired) {
        const re = new RegExp(config.config.regexp);

        return !re.test(data) ? validateNumberResult.regexp.fail : validateNumberResult.regexp.passed;
      }
      return validateNumberResult.regexp.passed;
    },
  },
];
