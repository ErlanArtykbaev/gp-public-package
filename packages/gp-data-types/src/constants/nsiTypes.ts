export const PRIMITIVE_TYPES = {
  NUMBER: 'number',
  INTEGER: 'integer',
  STRING: 'string',
};

export const COMPLEX_TYPES = {
  COMPLEX: 'complex',
};

export const SIMPLE_TYPES = {
  AUTO: 'auto',
  DATE: 'date',
  BOOL: 'bool',
  REFERENCE: 'reference',
  LINK: 'link',
  CLASSIFIER_SCHEMA: 'classifier_schema',
  CLASSIFIER: 'classifier',
  LIST: 'list',
  FILE: 'file',
  COMPUTABLE: 'computable',
  UUID: 'uuid',
  GEOJSON: 'geojson',
  TABLE: 'table',
  FIAS: 'fias',
  EGRUL: 'egrul',
  ...PRIMITIVE_TYPES,
};

export const TYPES = {
  ...SIMPLE_TYPES,
  ...COMPLEX_TYPES,
};

export const SIMPLE_TYPE_NAMES: string[] = Object.keys(SIMPLE_TYPES)
  .map(id => SIMPLE_TYPES[id]);

export const PRIMITIVE_TYPES_NAMES: string[] = Object.keys(PRIMITIVE_TYPES)
  .map(id => PRIMITIVE_TYPES[id]);
