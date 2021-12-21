import { Schema, SchemaProperty, Element, SchemaConfig } from '@gostgroup/gp-types/lib/nsi';

export type WrapperComponentProps = {
  data: Record<string, any>;
  formSchema: Schema;
  validateRow?: Function;
  getRowPath?: Function;
  basicData?: {
    startDate: string;
    endDate: string;
  };
  element?: Element;
  elementPath?: string;
  filterDate?: boolean;
  readOnly?: boolean;
};

export type WrapperOnlyState = {
  references: Record<string, any>[];
  formSchema: Schema;
};

export type CommonWrapperState = {
  /**
   * Объект с ошибками с id-ключами из config.properties[i].
   * Можно сделать дженерик для типизации списка ключей объекта.
   */
  formErrors: Record<string, any>;
  /**
   * Объект с данными формы с id-ключами из config.properties[i].
   * Можно сделать дженерик для типизации списка ключей объекта.
   */
  formState: Record<string, any>;
  /**
   * Справочники грузяться.
   */
  areReferencesLoading: boolean;
  /**
   * Это объект со справочниками.
   * Пригодится для селект-листа.
   * Название ключа объекта - id (идентификатор поля) из config.properties[i].
   */
  allReferences: Record<string, any>;
  /**
   * Влаг валидности формы.
   */
  isFormValid: boolean;
};

export type WrapperState =
  WrapperOnlyState
  & CommonWrapperState
;

export type BaseInjectedToSourceProps = {
  processedFormSchema: Schema;
  onFormChange(schemaConfig: SchemaConfig, value: any): void;
};

export type WithFormValidatorInjectedProps =
  BaseInjectedToSourceProps
  & Partial<CommonWrapperState>
  & WrapperComponentProps
;

export type EnhancedWithFormValidatorProps =
  WrapperComponentProps
  & WithFormValidatorInjectedProps
;

export type WithFormValidatorOptions = {
  excludeFromValidation?: string[],
};
