import React, { Component, PropTypes } from 'react';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import every from 'lodash/every';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import set from 'lodash/set';
import merge from 'lodash/merge';
import moment from 'moment';
import { autobind } from 'core-decorators';
import { queryReferencesForEdit, queryReferencesForView } from '@gostgroup/gp-api-services/lib/helpers/queryReferences'; // TODO add decorator
import assembleNsiDataObject from '@gostgroup/gp-nsi-utils/lib/assembleNsiDataObject';
import createSimpleSchema from '@gostgroup/gp-nsi-utils/lib/createSimpleSchema';
import cleanRow from './clean.js';
import { validateRow as defaultValidateRow } from './validate/index.js';
import DefaultFormRow from './row/FormRow';
import DefaultFileLink from './components/DefaultFileLink';
import DefaultReferenceLink from './components/DefaultReferenceLink';
import { unwrapProperties } from './helpers/index.js';
import calculateComputables from './helpers/computable.js';
import mergeReferences from './utils/mergeReferences';
import processDependencies, { needRecompute } from './helpers/dependencies/processDependencies';

const sortByField = key => arr => sortBy(arr, key);
const sortByTitle = sortByField('title');

export default Wrapped => @autobind class NsiFormHOC extends Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    data: PropTypes.object,
    basicData: PropTypes.object,
    element: PropTypes.shape({
      element: PropTypes.shape({
        absolutPath: PropTypes.string.isRequired,
      }).isRequired,
    }),
    FormRow: PropTypes.func.isRequired,
    ReferenceLink: PropTypes.func,
    FileLink: PropTypes.func,
    onChange: PropTypes.func,
    validateRow: PropTypes.func,
    readOnly: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    filterDate: PropTypes.string,
    getRowPath: PropTypes.func,
  }

  static defaultProps = {
    validateRow: defaultValidateRow,
    FormRow: DefaultFormRow,
    ReferenceLink: DefaultReferenceLink,
    FileLink: DefaultFileLink,
    basicData: {
      startDate: moment().format(global.SERVER_DATE_FORMAT), // TODO move to config
      endDate: moment().format(global.SERVER_DATE_FORMAT),
    },
    getRowPath: row => row.id,
  }

  static childContextTypes = {
    queryReferencesForView: PropTypes.func,
    queryReferencesForEdit: PropTypes.func,
    FormRow: PropTypes.func,
    element: PropTypes.object,
    ReferenceLink: PropTypes.func,
    FileLink: PropTypes.func,
    validateRow: PropTypes.func,
    readOnly: PropTypes.bool,
    schema: PropTypes.object,
    getFullData: PropTypes.func,
    setAsyncLoadedReferences: PropTypes.func,
    elementPath: PropTypes.string,
    fullReferences: PropTypes.shape({}),
  }

  /**
   * Начальное состояние формы
   * @type {Object}
   * @property {Object} references - ссылки на другие справочники referenceKey{string}:referenceData{object[]}
   * @property {Object} asyncLoadedReferences - аналог references, но содержит данные полученные при серверном поиске
   * @property {Object} allReferences - результат mergeReferences(references, asyncLoadedReferences)
   */
  static initialState = {
    references: [],
    asyncLoadedReferences: {},
    allReferences: {},
    fullReferences: {},
  }

  constructor(props) {
    super(props);

    this.state = Object.assign({
      schema: props.config,
    }, NsiFormHOC.initialState);
    this.handleGetReferences(props.config, props.basicData);
  }

  processSchema(oldData, data) {
    const { allReferences, schema } = this.state;

    if (!needRecompute(schema, oldData, data)) {
      return;
    }

    const processed = processDependencies(schema.dependencies, schema, data, allReferences);
    const processedSchema = processed.schema;
    data = processed.data;

    if (!isEqual(data, this.props.data) && this.props.onChange) {
      const isValid = this.validate(processedSchema, data);
      this.props.onChange(data, this.cleanData(data), isValid);
    }
    if (!isEqual(this.state.processedSchema, processedSchema)) {
      this.setState({ processedSchema });
    }
  }

  queryReferencesForViewNoDates(key, path, query, entryId) {
    const { basicData } = this.props;
    return queryReferencesForView(key, path, basicData.startDate, basicData.endDate, query, entryId);
  }

  queryReferencesForEditNoDates(key, path, query, entryId) {
    const { basicData } = this.props;
    return queryReferencesForEdit(key, path, basicData.startDate, basicData.endDate, query, entryId);
  }

  // пропса не меняется и FormRow можно сднелать pure
  getFullData() {
    return this.props.data;
  }

  getChildContext() {
    const { FormRow, ReferenceLink, validateRow, onChange, FileLink,
      element, readOnly, elementPath } = this.props;
    const { setAsyncLoadedReferences, getFullData } = this;
    const { schema, processedSchema, fullReferences } = this.state;

    return {
      queryReferencesForEdit: this.queryReferencesForEditNoDates,
      queryReferencesForView: this.queryReferencesForViewNoDates,
      FormRow,
      ReferenceLink,
      validateRow,
      FileLink,
      element,
      elementPath: get(element, 'element.absolutPath', get(element, 'absolutPath', elementPath)),
      schema: processedSchema || schema,
      readOnly: readOnly || !onChange,
      getFullData,
      setAsyncLoadedReferences,
      fullReferences,
    };
  }

  componentWillMount() {
    this.initDefaults();
    this.processSchema(null, this.props.data);
  }

  componentWillReceiveProps(nextProps) {
    const schemaHasChanged = !isEqual(this.props.config, nextProps.config);
    const basicDataHasChanged = !isEqual(this.props.basicData, nextProps.basicData);

    if (schemaHasChanged || basicDataHasChanged) {
      this.handleGetReferences(nextProps.config, nextProps.basicData);
    }

    if (schemaHasChanged) {
      this.setState({ schema: nextProps.config });
      const isValid = this.validate(nextProps.config, nextProps.data || {});
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(nextProps.data, nextProps.data, isValid);
      }
    }

    this.processSchema(this.props.data, nextProps.data);
  }

  setAsyncLoadedReferences(key, referenceData) {
    const { asyncLoadedReferences, references } = this.state;
    const newAsyncLoadedReferences = mergeReferences(asyncLoadedReferences, {
      [key]: referenceData,
    });
    this.setState({
      asyncLoadedReferences: newAsyncLoadedReferences,
      allReferences: mergeReferences(...references.map(r => ({ [r.key]: r.references })), newAsyncLoadedReferences),
    });
  }

  async handleGetReferences(config, basicData) {
    const { asyncLoadedReferences } = this.state;
    if (typeof basicData === 'undefined') return;
    const references = (await this._getReferences(config, basicData))
      .map(r => ({ [r.key]: r.references }));
    this.setState({
      references,
      allReferences: mergeReferences(...references, asyncLoadedReferences),
    });
  }

  _getReferences(config, basicData) {
    const { element, data } = this.props;
    const readOnly = !this.props.onChange;
    const queryReferences = readOnly ? queryReferencesForView : queryReferencesForEdit;
    const currentPath = get(element, 'element.absolutPath', this.props.elementPath);
    const { startDate, endDate } = basicData;
    const filterDate = readOnly ? this.props.filterDate : undefined;

    const cleanAndReassembledReferences = uniq(
      config.config.properties
        .concat(flatten((config.types || []).map(type => type.config.properties)))
        .map(row => ({ key: row.config.key, id: row.id, config: row.config }))
        .filter(obj => obj.key)
    );

    const referencePromises = cleanAndReassembledReferences
        .map((obj) => {
          const entryId = data[obj.id];
          // TODO здесь this.props.data[obj.id] может вернуть массив, нужно переделать
          return queryReferences(obj.key, currentPath, startDate, endDate, filterDate, entryId).then((references) => {
            let fields = {};
            const key = obj.key;
            if (references.element) {
              fields = references.element.schema.config.properties.filter(p => p.required).map(prop => ({ value: prop.id, label: prop.title }));
              const availableReferences = sortByTitle(
                references.result.filter(ref => (typeof ref.available === 'undefined') || ref.available)
              );
              const notAvailableReferences = sortByTitle(
                references.result.filter(ref => (typeof ref.available !== 'undefined') && !ref.available)
              );
              references = availableReferences.concat(notAvailableReferences);
            }
            references.result.map(ref => Object.assign(ref, ref.version)); // для сбалансированных иерархий
            return {
              key,
              references,
              fields,
            };
          });
        });

    return Promise.all(referencePromises.filter(p => p));
  }

  _getAllPropertiesFromConfig(config) {
    return [
      ...config.config.properties,
      ...flatten(config.types.map(type => type.config.properties)),
    ];
  }

  initDefaults() {
    const { data, config } = this.props;
    const initialData = assembleNsiDataObject(createSimpleSchema(config));
    const mergedData = merge({}, initialData, data);
    const dataChanged = !isEqual(mergedData, data);
    const isValid = this.validate(this.props.config, mergedData);

    if (typeof this.props.onChange === 'function' && (dataChanged || !isValid)) {
      this.props.onChange(mergedData, mergedData, isValid);
    }
  }

  validate(config, data) {
    const { allReferences, processedSchema } = this.state;

    return every(
      unwrapProperties(processedSchema || this.state.schema),
      rowConfig => !this.props.validateRow(rowConfig, data[rowConfig.id], allReferences)
    );
  }

  cleanData(data) {
    return unwrapProperties(this.props.config)
          .reduce((acc, row) => { acc[row.id] = cleanRow(row, data[row.id]); return acc; }, {});
  }

  handlePropertyChange(row, value) {
    const { allReferences } = this.state;
    const addedProperty = set({}, this.props.getRowPath(row), value);
    const { config } = row;
    const { copyValueOn, copyValueField } = config;
    if (copyValueOn && copyValueField && copyValueField !== '' && (!this.props.data[copyValueField] || this.props.data[copyValueField] === '' || this.props.data[copyValueField] === this.props.data[row.id])) {
      set(addedProperty, copyValueField, value);
    }

    // NOTE здесь был merge, поменял на assign, т.к. не удалялись элементы списка
    let data = row.deepPath
      ? merge({}, this.props.data, addedProperty)
      : Object.assign({}, this.props.data, addedProperty);

    const computables = calculateComputables(
      this.props.config.config.properties,
      allReferences,
      data
    );

    data = Object.assign({},
      data,
      ...computables
    );

    const isValid = this.validate(this.props.config, data);

    if (this.props.onChange) {
      this.props.onChange(data, this.cleanData(data), isValid);
    }
  }

  render() {
    return (<Wrapped
      {...this.props}
      schema={this.state.processedSchema || this.state.schema}
      allReferences={this.state.allReferences}
      handlePropertyChange={this.handlePropertyChange}
    />);
  }
};
