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
    // validator(config, data, references = {}) {
    //   const reference = references[config.config.key];
    //
    //   return config.required && (!reference || typeof data === 'undefined' || !_(reference).find(ref => ref.id === data)) ? `Поле "${config.title}" должно быть заполнено` : void 0;
    // },
    validator(config, data, references = {}) {
      // const reference = references[config.config.key];
      const invalidValueCondition =
        typeof data === 'undefined'
        || data === null
        || data === ''
      ;
      const errorMessage = config.required && (invalidValueCondition)
        ? validateReferenceResult.required.fail
        : validateReferenceResult.required.passed
      ;

      return errorMessage;

      // if (Object.keys(references).length === 0) {
      //   return config.required && (invalidValueCondition) ? validateReferenceResult.required.fail : validateReferenceResult.required.passed;
      // } else {
      //   return config.required && (invalidValueCondition) ? validateReferenceResult.required.fail : validateReferenceResult.required.passed;
      // }
      // return config.required && (!reference || typeof data === 'undefined' || !reference.find(ref => ref.id === data)) ? validateReferenceResult.required.fail : validateReferenceResult.required.passed;
    },
  },
];
