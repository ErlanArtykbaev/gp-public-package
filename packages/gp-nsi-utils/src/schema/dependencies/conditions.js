import merge from 'lodash/merge';
import setIn from 'lodash/fp/set';
import last from 'lodash/last';
import get from 'lodash/get';
import escapeString from 'lodash/escape';
import extractProperties from '../../extractProperties';

const idToValue = c => ({ ...c, value: c.id });
const stringFormatter = value => `"${escapeString(value)}"`;
const boolFormatter = value => !!value;
const numberFormatter = Number;

const schemaPropertyUpdater = (schema, path, update) => { // eslint-disable-line
  const parts = path.split('.');
  let type = schema;
  const types = schema.types;
  const typeIds = types.map(t => t.id);
  parts.forEach((id) => {
    const prop = extractProperties(type).find(p => p.id === id);
    if (typeIds.includes(prop.type) && last(parts) !== prop.id) {
      type = types.find(t => t.id === prop.type);
    } else {
      // console.warn('merging', prop);
      // error if not last
      const finalUpdate = typeof update === 'function' ? update(prop) : update;
      merge(prop, finalUpdate);
    }
  });
  return schema;
};

const config = obj => ({ config: obj });

const CONDITIONS_IF = [
  {
    id: 'equals',
    label: 'Равно',
    valueFormatter: stringFormatter,
    validator: (data, value) => String(get(data, 'id', data)) === String(value),
    types: ['string', 'number', 'integer', 'reference'],
  },
  {
    id: 'not_equals',
    label: 'Неравно',
    valueFormatter: stringFormatter,
    validator: (data, value) => String(data) !== String(value),
    types: ['string', 'number', 'integer', 'reference'],
  },
  {
    id: 'lt',
    label: 'Меньше',
    valueFormatter: numberFormatter,
    validator: (data, value) => data < value,
    types: ['integer', 'number'],
  },
  {
    id: 'not_lt',
    label: 'Не меньше',
    valueFormatter: numberFormatter,
    validator: (data, value) => data >= value,
    types: ['integer', 'number'],
  },
  {
    id: 'gt',
    label: 'Больше',
    valueFormatter: numberFormatter,
    validator: (data, value) => data > value,
    types: ['integer', 'number'],
  },
  {
    id: 'not_gt',
    label: 'Не больше',
    valueFormatter: numberFormatter,
    validator: (data, value) => data <= value,
    types: ['integer', 'number'],
  },
  {
    id: 'is_not_empty',
    label: 'Заполнено',
    valueFormatter: stringFormatter,
    validator: data => !!data,
    auto: true,
  },
  {
    id: 'regex',
    label: 'Рег. выр.',
    valueFormatter: value => `/${value}/`,
    validator: (data, value) => {
      try {
        const r = new RegExp(value);
        return r.test(data);
      } catch (e) {
        return false;
      }
    },
    types: ['string'],
  },
  // {
  //   id: 'null',
  //   label: 'Нулевое',
  //   validator: data => !data,
  //   auto: true,
  //   types: ['bool'],
  // },
  {
    id: 'includes',
    label: 'Содержит',
    valueFormatter: stringFormatter,
    validator: (data, value) => data.includes(value),
    types: ['string'],
  },
  {
    id: 'starts_with',
    label: 'Начинается с',
    valueFormatter: stringFormatter,
    validator: (data, value) => data.startsWith(value),
    types: ['string'],
  },
  {
    id: 'ends_with',
    label: 'Заканчивается на',
    valueFormatter: stringFormatter,
    validator: (data, value) => data.endsWith(value),
    types: ['string'],
  },
  {
    id: 'true',
    label: 'Истина',
    valueFormatter: boolFormatter,
    validator: data => data === true,
    auto: true,
    types: ['bool'],
  },
  {
    id: 'false',
    label: 'Ложь',
    valueFormatter: boolFormatter,
    validator: data => data === false,
    auto: true,
    types: ['bool'],
  },
  // {
  //   id: 'list_has',
  //   label: 'Содержит',
  //   types: ['list'],
  // },
].map(idToValue);

const CONDITIONS_THEN = [
  // {
  //   label: 'Показать',
  //   id: 'show',
  //   auto: true,
  // },
  {
    label: 'Скрыть',
    id: 'hide',
    auto: true,
    message: path => `Поле ${path} стало скрытым`,
    resolver: (path, schema, data) => ({
      schema: schemaPropertyUpdater(schema, path, config({ hidden: true })),
      data,
    }),
  },
  // {
  //   label: 'Редактируемо',
  //   id: 'editable',
  //   auto: true,
  // },
  {
    label: 'Не редактируемо',
    id: 'readOnly',
    auto: true,
    message: path => `Поле ${path} стало нередактируемым`,
    resolver: (path, schema, data) => ({
      schema: schemaPropertyUpdater(schema, path, config({ readOnly: true })),
      data,
    }),
  },
  // {
  //   label: 'Не активно',
  //   id: 'disabled',
  //   auto: true,
  // },
  {
    label: 'Обязательно',
    id: 'required',
    auto: true,
    message: path => `Поле ${path} стало обязательным`,
    resolver: (path, schema, data) => ({
      schema: schemaPropertyUpdater(schema, path, { required: true }),
      data,
    }),
  },
  {
    label: 'Приравнять к',
    id: 'equalize_to',
    valueFormatter: numberFormatter,
    message: (path, value) => `Поле ${path} стало равно ${value}`,
    resolver: (path, schema, data, value, ruleValue) => ({
      schema,
      data: ruleValue.type === 'field' ? setIn(path, get(data, value), data) : setIn(path, value, data),
    }),
    types: ['string', 'number', 'integer', 'reference'],
  },
  // TODO implement for all
  {
    label: 'Может равняться',
    id: 'must_be',
    valueFormatter: numberFormatter,
    // message: (path, value) => `Поле ${path} стало равно ${value}`,
    resolver: (path, schema, data, value) => ({
      schema: schemaPropertyUpdater(schema, path, prop => config({ required: true, possibleValues: [...get(prop, 'config.possibleValues', []), value] })),
      data,
    }),
    types: ['reference'],
  },
  {
    label: 'Должно быть меньше',
    id: 'must_lt',
    valueFormatter: numberFormatter,
    resolver: (path, schema, data, value) => ({
      schema: schemaPropertyUpdater(schema, path, config({ max: value })),
      data,
    }),
    types: ['number', 'integer'],
  },
  {
    label: 'Должно быть не больше',
    id: 'must_not_gt',
    valueFormatter: numberFormatter,
    validator: (data, value) => data <= value,
    types: ['number', 'integer'],
  },
  {
    label: 'Должно быть больше',
    id: 'must_gt',
    valueFormatter: numberFormatter,
    validator: (data, value) => data > value,
    types: ['number', 'integer'],
  },
  {
    label: 'Должно быть больше',
    id: 'date_must_gt',
    valueFormatter: numberFormatter,
    message: (path, value) => `Поле ${path} должно быть больше ${data[value]}`,
    resolver: (path, schema, data, value, ruleValue) => ({
      schema: schemaPropertyUpdater(schema, path, config({ min: data[value] })),
      data,
    }),
    types: ['date'],
  },
  {
    label: 'Должно быть не больше',
    id: 'date_must_not_gt',
    valueFormatter: numberFormatter,
    message: (path, value) => `Поле ${path} должно быть не больше ${data[value]}`,
    resolver: (path, schema, data, value, ruleValue) => ({
      schema: schemaPropertyUpdater(schema, path, config({ max: data[value] })),
      data,
    }),
    types: ['date'],
  },
].map(idToValue);

const filterAuto = c => !!c.auto;
const mapValue = c => c.value;

const defaultValidators = {
  safeValidator: callback => (data, value) => {
    try {
      return callback(data, value);
    } catch (e) {
      return false;
    }
  },
};

const conditions = {
  if: {
    base: CONDITIONS_IF,
    defaultValue: 'equals',
    auto: CONDITIONS_IF.filter(filterAuto).map(mapValue),
  },
  then: {
    base: CONDITIONS_THEN,
    defaultValue: 'hide',
    auto: CONDITIONS_THEN.filter(c => !!c.auto).map(mapValue),
  },
  else: {
    base: CONDITIONS_THEN,
    defaultValue: 'hide',
    auto: CONDITIONS_THEN.filter(c => !!c.auto).map(c => c.value),
  },
  validators: {
    if: CONDITIONS_IF.reduce((p, c) => { p[c.id] = c.validator; return p; }, { ...defaultValidators }),
    then: CONDITIONS_THEN.reduce((p, c) => { p[c.id] = c.validator; return p; }, { ...defaultValidators }),
  },
  formatters: {
    if: CONDITIONS_IF.reduce((p, c) => { p[c.id] = c.valueFormatter; return p; }, {}),
    then: CONDITIONS_THEN.reduce((p, c) => { p[c.id] = c.valueFormatter; return p; }, {}),
  },
};

export default conditions;
