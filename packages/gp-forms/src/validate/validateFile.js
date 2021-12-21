const validateFileResult = {
  uploadError: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => 'Ошибка при загрузке (максимальный размер заргужаемого файла составляет 100 мб)',
    },
  },
  required: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Файл "${config.title}" обязателен для загрузки`,
    },
  },
  uploading: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => 'Идет загрузка...',
    },
  },
};

export const validators = [];

export const fixedValidators = [
  {
    name: 'uploadError',
    validator(config, data = {}) {
      return data && data.uploadError ? validateFileResult.required.fail : validateFileResult.required.passed;
    },
  },
  {
    name: 'required',
    validator(config, data) {
      return config.required && !(data && data.uuid) ? validateFileResult.required.fail : validateFileResult.required.passed;
    },
  },
  {
    name: 'uploading',
    validator(config, data = {}) {
      return data && data.uploading ? validateFileResult.required.fail : validateFileResult.required.passed;
    },
  },
];
