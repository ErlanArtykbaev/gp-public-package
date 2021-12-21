import moment from 'moment';

const dateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

const validateDateResult = {
  date: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть датой в виде ${global.APP_DATE_FORMAT_RUS.toUpperCase()}`,
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
  max: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть не больше "${moment(config.config.min).format(`${global.APP_DATE_FORMAT} HH:mm:ss`)}"`,
    },
  },
  min: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть больше "${moment(config.config.min).format(`${global.APP_DATE_FORMAT} HH:mm:ss`)}"`,
    },
  },
};

export const validators = [];

export const fixedValidators = [
  {
    name: 'date',
    validator(config, data = '') {
      if (data === '') {
        return validateDateResult.date.passed;
      }
      const test = dateRegex.test(data);

      if (!config.required) {
        return validateDateResult.date.passed;
      }
      if (!test) {
        return validateDateResult.date.fail;
      } else {
        const [, year, month, day] = dateRegex.exec(data).map(value => parseInt(value, 10));
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day ? validateDateResult.date.passed : validateDateResult.date.fail;
      }
    },
  },
  {
    name: 'max',
    validator(config, data = '') {

      if (config.config.max) {

        return moment(data).isSameOrBefore(config.config.max) ? validateDateResult.max.passed : validateDateResult.max.fail;
      }

      return validateDateResult.max.passed;
    }
  },
  {
    name: 'min',
    validator(config, data = '') {

      if (config.config.min) {

        return moment(data).isAfter(config.config.min) ? validateDateResult.min.passed : validateDateResult.min.fail;
      }

      return validateDateResult.min.passed;
    }
  },
  {
    name: 'required',
    validator(config, data = '') {
      return config.required && !data ? validateDateResult.required.fail : validateDateResult.required.passed;
    },
  },
];
