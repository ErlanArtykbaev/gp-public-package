const validateTextResult = {
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
};

export const validators = [
  {
    name: 'minLength',
    validator(config, data = '') {
      return data.length < config.config.minLength ? validateTextResult.minLength.fail : validateTextResult.minLength.passed;
    },
  },
  {
    name: 'maxLength',
    validator(config, data = '') {
      return data.length > config.config.maxLength ? validateTextResult.maxLength.fail : validateTextResult.maxLength.passed;
    },
  },
];

export const fixedValidators = [
  {
    name: 'required',
    validator(config, data) {
      return config.required && !data ? validateTextResult.required.fail : validateTextResult.required.passed;
    },
  },
];
