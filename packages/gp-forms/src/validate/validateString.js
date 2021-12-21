import has from 'lodash/has';

const validateStringResult = {
  minLength: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть не менее ${config.config.minLength} символов`,
    },
  },
  maxLength: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть не более ${config.config.maxLength} символов`,
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
  length: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Длина поля "${config.title}" не должна превышать 255 символа`,
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
    name: 'minLength',
    validator(config, data) {
      return config.config && (data.length < config.config.minLength) ? validateStringResult.minLength.fail : validateStringResult.minLength.passed;
    },
  },
  {
    name: 'maxLength',
    validator(config, data = '') {
      return config.config && (data.length > config.config.maxLength) ? validateStringResult.maxLength.fail : validateStringResult.maxLength.passed;
    },
  },
];

export const fixedValidators = [
  {
    name: 'required',
    validator(config, data) {
      if (data) {
        data = data.toString();
      }
      return (config.required && !data) || (config.required && data && !data.replace(/\s/g, '').length) ? validateStringResult.required.fail : validateStringResult.required.passed;
    },
  },
  {
    name: 'length',
    validator(config, data) {
      switch (config.id) {
        case 'title':
          return data && data.length > 255 ? validateStringResult.length.fail : validateStringResult.length.passed;
        default:
          // return data && data.length > 255 ? `Длина поля "${config.title}" не должна превышать 255 символов` : undefined;
          return validateStringResult.length.passed;
      }
    },
  },
  {
    name: 'regexp',
    validator(config, data = '') {
      if (config.config) {
        if (!has(config, 'config.regexp') || !has(config, 'config.test') || data === '' || data === null) {
          return validateStringResult.regexp.passed;
        }
        const r = config.config.regexp;
        return ((new RegExp(r)).test(data) === false) ? validateStringResult.regexp.fail : validateStringResult.regexp.passed;
      }
      return validateStringResult.regexp.passed;
    },
  },
];
