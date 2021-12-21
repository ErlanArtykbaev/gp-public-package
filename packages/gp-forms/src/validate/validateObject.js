import first from 'lodash/first';
import { validateRow } from './validateRow';

export const validators = [];

export const fixedValidators = [
  {
    name: 'required',
    validator(config, data) {
      return config.required && (typeof data !== 'object' || data === null) ? `Поле "${config.title}" содержит некорректные данные` : undefined;
    },
  },
  {
    name: 'validFields',
    validator(config, data = {}, references) {
      const error = first(config.config.properties
        .map(row => validateRow(row, data[row.id], references))
        .filter(r => !!r));
      return error ? `Поле "${config.title}" содержит некорректные данные` : undefined;
    },
  },
];
