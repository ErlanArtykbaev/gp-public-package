export interface SchemaPropertyConfig {
  [key: string]: any;
}

export interface SchemaProperty {
  /* Идентификатор */
  id: string;
  /* Наименование */
  title: string;
  /* Тип данных */
  type: string;
  /* Обязательность */
  required: boolean;
  /* Уникальность */
  unique: boolean;
  /* Конфигурация в соответствии с типом */
  config: SchemaPropertyConfig;
}

export interface SchemaConfig {
  properties: SchemaProperty[];
}

export interface Schema {
  id: string;
  title: string;
  extends: string;
  dependencies?: string[];
  deduplicationRules: {};
  config: SchemaConfig;
  types: Schema[];
}
