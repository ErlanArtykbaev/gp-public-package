/**
 * Хок для форм, основанных на НСИ-схеме.
 * На вход подаём всё согласно интерфейсу WrapperComponentProps (types.d.ts).
 * Важно уже на входе иметь валидную НСИ-схему props.formSchema, иначе валидация будет работать неправильно.
 * В обёрнутый компонент основные пропсы прилетают из CommonWrapperState (types.d.ts).
 *
 * Данные формы props.data (c обязательным полем id, при смене которого стейт формы пересчитается) требуются для инициализации,
 * дальше стейт формы обрабатывается внутри хока и прилетает через props.formState
 *
 * Через пропс excludeFromValidation хока configurableFormValidator можно убирать поля из валидации, чтобы обрабатывать их вручную.
 * Основной хок withFormValidator экспортируется без обработчика excludeFromValidation
 */
import * as React from 'react';
import * as moment from 'moment';
import {
  merge,
  get,
  uniq,
  flatten,
  sortBy,
  every,
  set,
  omit,
} from 'lodash';

import assembleNsiDataObject from '@gostgroup/gp-nsi-utils/lib/assembleNsiDataObject';
import createSimpleSchema from '@gostgroup/gp-nsi-utils/lib/createSimpleSchema';
import { queryReferencesForEdit, queryReferencesForView } from '@gostgroup/gp-api-services/lib/helpers/queryReferences';

import { validateRow as defaultValidateRow } from '@gostgroup/gp-forms/lib/validate';
import cleanRow from '@gostgroup/gp-forms/lib/clean';
import processDependencies, { needRecompute } from '@gostgroup/gp-forms/lib/helpers/dependencies/processDependencies';
import { unwrapProperties } from '@gostgroup/gp-forms/lib/helpers';
import calculateComputables from '@gostgroup/gp-forms/lib/helpers/computable';
import mergeReferences from '@gostgroup/gp-forms/lib/utils/mergeReferences';
import validateSchema from '@gostgroup/gp-forms/lib/validate/validateSchema';
import { Schema, SchemaConfig } from '@gostgroup/gp-types/lib/nsi';
import { EnhancedWithFormValidatorProps, WrapperState, WithFormValidatorOptions, WithFormValidatorInjectedProps } from './types';

const sortByField = key => arr => sortBy(arr, key);
const sortByTitle = sortByField('title');

export const withFormValidatorHOC = (options: WithFormValidatorOptions = { excludeFromValidation: [] }) => <InferredProps extends EnhancedWithFormValidatorProps>(
  SourceComponent: React.ComponentType<InferredProps>,
) => class WithFormValidatorHOC extends React.Component<InferredProps, WrapperState> {
  static defaultProps = {
    validateRow: defaultValidateRow,
    getRowPath: row => row.id,
    basicData: {
      startDate: moment().format(global.SERVER_DATE_FORMAT),
      endDate: moment().format(global.SERVER_DATE_FORMAT),
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      formState: {},
      formErrors: {},
      isFormValid: true,
      formSchema: props.formSchema,
      references: [],
      allReferences: {},
      areReferencesLoading: false,
    };
  }

  componentWillMount() {
    if (!this.state.formSchema) {
      return;
    }

    this.initFormState(this.props, this.state.formSchema);
    this.handleGetReferences(this.state.formSchema, this.props.basicData);
  }

  componentWillReceiveProps(nextProps) {
    const currentDataId = get(this.props, 'data.id', null);
    const nextDataId = get(nextProps, 'data.id', null);

    const currentSchemaId = get(this.props, 'formSchema.id', null);
    const nextSchemaId = get(nextProps, 'formSchema.id', null);

    if ((nextSchemaId !== null) && (currentSchemaId !== nextSchemaId)) {
      this.initFormState(nextProps, nextProps.formSchema);
      this.handleGetReferences(nextProps.formSchema, this.props.basicData);
    }

    if ((nextDataId !== null) && (nextDataId !== currentDataId)) {
      this.initFormState(nextProps, this.state.formSchema);
    }

  }
  updateFormState(formState, formSchema, restState = {}) {
    const { isFormValid, formErrors } = this.validateFormData(formState, formSchema);

    this.setState({
      formState,
      formErrors,
      formSchema,
      isFormValid,
      ...restState,
    });
  }
  initFormState(props, formSchema) {
    const newFormState = this.getDefaultFormState(props.data, formSchema);
    const proccessingResult = this.processSchema(null, newFormState, formSchema);

    this.updateFormState(proccessingResult.formState, proccessingResult.formSchema);
  }
  getDefaultFormState(data, formSchema) {
    const initialData = assembleNsiDataObject(createSimpleSchema(formSchema));
    const mergedData = merge({}, initialData, data);

    return mergedData;
  }
  async handleGetReferences(formSchema: Schema, basicData) {
    if (typeof basicData === 'undefined') return;

    const references = (await this.getReferences(formSchema, basicData))
      .map((r: any) => ({ [r.id]: r.references }));

    /**
     * Получили справочники - пересчитали стейт формы и схему
     */
    const processingResult = formSchema.config.properties
      .map(prop => this.handleProperty(prop, this.state.formState[prop.id], formSchema))
      .reduce((prev, curr) => ({
        formState: {
          ...prev.formState,
          ...curr.formState,
        },
        formSchema: {
          ...prev.formSchema,
          ...curr.formSchema,
        },
      }), {
        formState : {},
        formSchema: {
          config: {
            properties: [],
          },
        },
      });


    const allReferences = mergeReferences(...references, {});

    this.updateFormState(
      processingResult.formState,
      processingResult.formSchema, {
        allReferences,
        references,
        areReferencesLoading: false,
      },
    );
  }

  getReferences(formSchema, basicData) {
    const { element } = this.props;
    const { formState } = this.state;
    const readOnly = this.props.readOnly;

    const queryReferences = readOnly ? queryReferencesForView : queryReferencesForEdit;
    const currentPath = get(element, 'element.absolutPath', this.props.elementPath);
    const { startDate, endDate } = basicData;
    const filterDate = readOnly ? this.props.filterDate : undefined;

    const cleanAndReassembledReferences = uniq(
      formSchema.config.properties
        .concat(flatten((formSchema.types || []).map(type => type.config.properties)))
        .map(row => ({ key: row.config.key, id: row.id, config: row.config }))
        .filter(obj => obj.key),
    );

    this.setState({
      areReferencesLoading: true,
    });

    const referencePromises = cleanAndReassembledReferences
      .map((obj) => {
        const entryId = formState[obj.id];
        // TODO здесь this.props.data[obj.id] может вернуть массив, нужно переделать
        return queryReferences(obj.key, currentPath, startDate, endDate, filterDate, entryId).then((references) => {
          let fields = {};
          const key = obj.key;
          if (references.element) {
            fields = references.element.schema.config.properties.filter(p => p.required).map(prop => ({ value: prop.id, label: prop.title }));
            const availableReferences = sortByTitle(
              references.result.filter(ref => (typeof ref.available === 'undefined') || ref.available),
            );
            const notAvailableReferences = sortByTitle(
              references.result.filter(ref => (typeof ref.available !== 'undefined') && !ref.available),
            );
            references = availableReferences.concat(notAvailableReferences);
          }
          references.map(ref => Object.assign(ref, ref.version)); // для сбалансированных иерархий
          return {
            key,
            references,
            fields,
            id: obj.id,
          };
        });
      });

    return Promise.all(referencePromises.filter(p => p));
  }
  validateFormData(data, formSchema) {
    const { allReferences } = this.state;

    const filteredSchema = omit({
      ...formSchema,
      config: {
        ...formSchema.config,
        properties: formSchema.config.properties.filter(prop => !options.excludeFromValidation.includes(prop.id)),
      },
    });
    const formErrors = validateSchema(filteredSchema, allReferences, data);

    const isFormValid = every(
      unwrapProperties(filteredSchema),
      rowConfig => !this.props.validateRow(rowConfig, data[rowConfig.id], allReferences),
    );

    return {
      isFormValid,
      formErrors,
    };
  }
  cleanData(data, formSchema) {
    return unwrapProperties(formSchema)
      .reduce((acc, row) => { acc[row.id] = cleanRow(row, data[row.id]); return acc; }, {});
  }
  processSchema(oldData, data, formSchema) {
    const { allReferences } = this.state;
    let newData = {
      ...data,
    };

    if (!needRecompute(formSchema, oldData, newData)) {
      return {
        formSchema,
        formState: newData,
      };
    }

    const processed = processDependencies(formSchema.dependencies, formSchema, newData, allReferences);
    const processedSchema = processed.schema;
    newData = processed.data;

    return {
      formSchema: processedSchema,
      formState: newData,
    };
  }
  handleProperty(row, value, formSchema) {
    const { allReferences, formState } = this.state;
    const { config: { copyValueOn, copyValueField } } = row;
    const addedProperty = set({}, this.props.getRowPath(row), value);

    if (
      copyValueOn
      && copyValueField
      && copyValueField !== ''
      && (
        !formState[copyValueField]
        || formState[copyValueField] === ''
        || formState[copyValueField] === formState[row.id]
      )
    ) {
      set(addedProperty, copyValueField, value);
    }

    const data = row.deepPath
      ? merge({}, formState, addedProperty)
      : Object.assign({}, formState, addedProperty);

    const computables = calculateComputables(
      formSchema.config.properties,
      allReferences,
      data,
    );

    const newData = {
      ...data,
      ...computables,
    };

    const newFormState = this.cleanData(newData, formSchema);
    const processingResult = this.processSchema(formState, newFormState, formSchema);

    return {
      formState: processingResult.formState,
      formSchema: processingResult.formSchema,
    };
  }
  handlePropertyChange = (row: SchemaConfig, value)  => {
    const processingResult = this.handleProperty(row, value, this.state.formSchema);

    this.updateFormState(processingResult.formState, processingResult.formSchema);
  }
  render() {
    return (
      <SourceComponent
        {...this.props}
        onFormChange={this.handlePropertyChange}
        formErrors={this.state.formErrors}
        formState={this.state.formState}
        isFormValid={this.state.isFormValid}
        allReferences={this.state.allReferences}
        processedFormSchema={this.state.formSchema}
        areReferencesLoading={this.state.areReferencesLoading}
      >
        {this.props.children}
      </SourceComponent>
    );
  }
};

export const configurableFormValidator = withFormValidatorHOC;
export const withFormValidator = withFormValidatorHOC();
export {
  WithFormValidatorInjectedProps,
};
