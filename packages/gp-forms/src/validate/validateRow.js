import * as string from './validateString';
import * as text from './validateText';
import * as number from './validateNumber';
import * as date from './validateDate.js';
import * as integer from './validateInteger';
import * as bool from './validateBool';
import * as reference from './validateReference';
import * as file from './validateFile';
import * as list from './validateList';
import * as computable from './validateComputable.js';
import * as object from './validateObject';
import * as geojson from './validateGeoJSON';
import * as classifier from './validateClassifier';
import validator from './validator';

const validatorsMap = {
  string,
  text,
  number,
  date,
  integer,
  bool,
  reference,
  file,
  list,
  object,
  computable,
  geojson,
  classifier,
};

function validateRowByType(type, rowConfig, value, references) {
  const typeValidators = validatorsMap[type] || {};
  const { validators = [], fixedValidators = [] } = typeValidators;
  const validate = validator(validators, fixedValidators);

  return typeof validate === 'function' ? validate(rowConfig, value, references) : undefined;
}

export function validateRow(rowConfig, value, references) {
  if (!rowConfig || !rowConfig.type) return undefined;

  let error = validateRowByType(rowConfig.type, rowConfig, value, references);

  if (!error && rowConfig.extends) {
    error = validateRowByType(rowConfig.extends, rowConfig, value, references);
  }

  // if (!error && rowConfig.config && rowConfig.config.customValidations) {
  //   return _(rowConfig.config.customValidations)
  //     .map(({ expression, message }) => eval(expression) ? message : undefined) // eslint-disable-line no-eval
  //     .filter()
  //     .first();
  // }

  return error;
}
