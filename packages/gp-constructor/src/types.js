import Immutable from 'immutable';

import customTypes from '@gostgroup/gp-data-types/lib';
import {
  PRIMITIVE_TYPE_NAMES as PRIMITIVE_TYPES,
  SIMPLE_TYPE_NAMES as SIMPLE_TYPES,
  TYPES,
} from '@gostgroup/gp-data-types/lib/constants/nsiTypes';
import StringEditor from './components/editors/StringEditor';
import PrimitiveEditor from './components/editors/PrimitiveEditor';
import ReferenceEditor from './components/editors/ReferenceEditor';
import LinkEditor from './components/editors/LinkEditor';
import ComplexEditor from './components/editors/ComplexEditor';
import ListEditor from './components/editors/list-editor';
import ComputableEditor from './components/editors/computable-editor';
import GeoJSONEditor from './components/editors/GeoJSONEditor';
import NumberEditor from './components/editors/NumberEditor';
import ClassifierEditor from './components/editors/ClassifierEditor';
import ClassifierSchemaEditor from './components/editors/ClassifierSchemaEditor';
import TableEditor from './components/TableEditor/TableEditor';
import DateEditor from './components/editors/DateEditor';

const types = [
  {
    id: TYPES.AUTO,
    title: 'Авто',
    defaultConfig: {},
  },
  {
    id: TYPES.NUMBER,
    title: 'Число',
    defaultConfig: {},
    editor: NumberEditor,
    primitive: true,
  },
  {
    id: TYPES.INTEGER,
    title: 'Целое',
    defaultConfig: {},
    editor: NumberEditor,
    primitive: true,
  },
  {
    id: TYPES.DATE,
    title: 'Дата',
    editor: DateEditor,
    defaultConfig: {},
  },
  {
    id: TYPES.STRING,
    title: 'Строка',
    defaultConfig: {},
    editor: StringEditor,
    primitive: true,
  },
  {
    id: TYPES.BOOL,
    title: 'Логический',
    defaultConfig: {},
  },
  {
    id: TYPES.REFERENCE,
    title: 'Справочник',
    editor: ReferenceEditor,
    defaultConfig: {},
  },
  {
    id: TYPES.LINK,
    title: 'Связь',
    editor: LinkEditor,
    defaultConfig: {},
  },
  {
    id: TYPES.CLASSIFIER_SCHEMA,
    title: 'Схема классификатора',
    editor: ClassifierSchemaEditor,
    defaultConfig: {},
  },
  {
    id: TYPES.CLASSIFIER,
    title: 'Классификатор',
    editor: ClassifierEditor,
    defaultConfig: {},
  },
  {
    id: TYPES.COMPLEX,
    title: 'Составной',
    editor: ComplexEditor,
    defaultConfig: {},
  },
  {
    id: TYPES.LIST,
    title: 'Список',
    editor: ListEditor,
    defaultConfig: {},
  },
  {
    id: TYPES.FILE,
    title: 'Файл',
    defaultConfig: {},
  },
  {
    id: TYPES.COMPUTABLE,
    title: 'Вычислимый',
    editor: ComputableEditor,
    defaultConfig: {},
  },
  {
    id: TYPES.UUID,
    title: 'UUID',
    defaultConfig: {},
  },
  {
    id: TYPES.GEOJSON,
    title: 'Геоданные',
    editor: GeoJSONEditor,
    defaultConfig: { borderColor: '#000000', borderWidth: '1', fillColor: '#FF0000', fillTransparency: 0.7 },
  },
  {
    id: TYPES.TABLE,
    title: 'Таблица',
    editor: ListEditor,
    defaultConfig: {},
  },
  ...customTypes,
];

export default Immutable.fromJS(types);

const typesMap = types.reduce((map, type) => {
  map[type.id] = type;
  return map;
}, {});

const TYPE_NAMES = types.reduce((result, type) => ({ ...result, [type.id]: type.title }), {});

export {
  typesMap,
  PRIMITIVE_TYPES,
  SIMPLE_TYPES,
  TYPE_NAMES,
};
