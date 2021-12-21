const validateReferenceResult = {
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

export const validators = [];

export const fixedValidators = [
  {
    name: 'required',
    validator(config, data) {
      return config.required && !data ? validateReferenceResult.required.fail : validateReferenceResult.required.passed;
    },
  },
];
