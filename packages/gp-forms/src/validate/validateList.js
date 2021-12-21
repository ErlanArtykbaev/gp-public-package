import first from 'lodash/first';
import { validateRow } from './validateRow';

const validateListResult = {
  required: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Список "${config.title}" должен содержать хотя бы одну строку`,
    },
  },
  validRows: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Список "${config.title}" содержит некорректные строки`,
    },
  },
};

export const validators = [];

export const fixedValidators = [
  {
    name: 'required',
    validator(config, data = []) {
      return data !== null && config.required && data.length === 0 ? validateListResult.required.fail : validateListResult.required.passed;
    },
  },
  {
    name: 'validRows',
    validator(config, data = [], references) {
      if (data === null) {
        return validateListResult.validRows.passed;
      }
      const error = first(data
        .map(row => validateRow(config.typeConfig, row, references))
        .filter(d => !!d));
      return error ? validateListResult.validRows.fail : validateListResult.validRows.passed;
    },
  },
];
