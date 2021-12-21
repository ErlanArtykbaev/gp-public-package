import { SimpleSelect } from 'react-selectize';
import React, { PropTypes } from 'react';
import get from 'lodash/get';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';
import { autobind } from 'core-decorators';
import cx from 'classnames';

import {
  RecursiveItemService,
  ElementService,
} from '@gostgroup/gp-api-services/lib/services';
import assembleNsiDataObject from '@gostgroup/gp-nsi-utils/lib/assembleNsiDataObject';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import Div from '@gostgroup/gp-ui-components/lib/Div';

import {
  DefaultSpinner,
  DefaultEditButton,
  DefaultInlineEditor,
  defaultRenderElements,
} from './components';
import ClassifierDataModal from './ClassifierDataModal';
import styles from './classifierInput.scss';
import './react-selectize.global.scss';


@withModal
@autobind
export default class ClassifierInput extends React.Component {
  static contextTypes = {
    FormRow: PropTypes.func.isRequired,
  }

  static propTypes = {
    data: PropTypes.shape({
      id: PropTypes.number,
      data: PropTypes.shape({}),
    }),
    onDataChange: PropTypes.func.isRequired,
    config: PropTypes.shape({}).isRequired,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
    modalIsOpen: PropTypes.bool,
    selectConfig: PropTypes.shape({}),
    element: React.PropTypes.object,
    error: React.PropTypes.string,
    queryReferencesForView: React.PropTypes.func,
    readOnly: React.PropTypes.bool,
    renderOption: PropTypes.func,
    getOptions: PropTypes.func,
    renderElements: PropTypes.func,
    // react components
    InlineEditor: PropTypes.func,
    FormComponent: PropTypes.func,
    EditButton: PropTypes.func,
    InputWrapper: PropTypes.func,
    SelectComponent: PropTypes.func,
    LoadingComponent: PropTypes.func,
  }

  static defaultProps = {
    renderElements: defaultRenderElements,
    InputWrapper: Div,
    InlineEditor: DefaultInlineEditor,
    EditButton: DefaultEditButton,
    FormComponent: ClassifierDataModal,
    SelectComponent: SimpleSelect,
    LoadingComponent: DefaultSpinner,
  }

  state = {
    referenceData: null,
    classifierKey: null,
    keyIsLoaded: false,
    referenceDataIsLoaded: false,
    isLoading: false,
    classifierSchemaIsLoaded: false,
    classifierSchemaError: false,
  }

  async componentDidMount() {
    await this.loadClassifierKey();
    await this.loadReferenceData();
    const { data } = this.props;
    const classifierId = get(data, 'id');
    if (classifierId) {
      this.handleClasifierChange(classifierId, true);
    }
  }

  loadReferenceData() {
    const { config, data = '', element, queryReferencesForView, getOptions } = this.props;
    const key = config.config.key;
    const absolutPath = get(element, 'element.absolutPath', get(element, 'absolutPath'));

    return (getOptions || queryReferencesForView)(key, absolutPath, undefined, data).then((referenceData) => {
      this.setState({ referenceData, referenceDataIsLoaded: true });
    });
  }

  manualLoadReferenceData = (loadData) => {   
    if (loadData && loadData.then) {
      this.setState({ referenceDataIsLoaded: false });
      loadData.then((referenceData) => {
        this.setState({ referenceData, referenceDataIsLoaded: true });
      }).catch(e => {
        console.log(e);
        this.setState({ referenceDataIsLoaded: true });
      });
    } else {
      this.setState({ referenceData, referenceDataIsLoaded: true });
    }    
  }

  loadClassifierKey() {
    const { config } = this.props;
    this.setState({ keyIsLoaded: false });
    return ElementService.path(config.config.key).get().then((element) => {
      const classifierSchemaProperty = get(element, 'schema.config.properties').find(p => p.type === 'classifier_schema');
      const classifierKey = classifierSchemaProperty.id;
      this.setState({ classifierElement: element, classifierKey, keyIsLoaded: true });
    });
  }

  loadClassifierSchema(value) {
    const { classifierKey } = this.state;
    const { config } = this.props;
    const absolutPath = config.config.key;

    // FIXME: detect depth
    return RecursiveItemService.path(absolutPath).get({ id: value, depth: 3 }).then((parentData) => {
      const schema = get(parentData, `version.object.${classifierKey}`);
      return {
        schema,
        // _data: get(parentData, 'version.object'),
      };
    });
  }

  handleClasifierChange(value, initial) {
    const { onDataChange } = this.props;
    if (isEmpty(value)) {
      onDataChange(null);
      this.setState({ classifierSchemaIsLoaded: false, classifierSchemaError: false, inputValue: '' });
      return;
    }

    this.setState({ isLoading: true, classifierSchemaError: false, inputValue: '' });
    this.loadClassifierSchema(value).then(({ schema }) => {
      const data = assembleNsiDataObject(schema);
      const classifierData = {
        id: value,
        data,
        // _data,
      };
      this.setState({
        classifierSchema: schema,
        isLoading: false,
        classifierSchemaIsLoaded: true,
        classifierSchemaError: typeof schema === 'undefined',
      });
      if (initial !== true) {
        onDataChange(classifierData);
      }
    });
  }

  handleClassifierDataChange(classifierData) {
    const { data, onDataChange } = this.props;
    onDataChange({ ...data, data: classifierData });
  }

  handleInlineClassifierDataChange(config, value) {
    this.handleClassifierDataChange(value);
  }

  renderSpinner() {
    const { LoadingComponent } = this.props;

    return <LoadingComponent />;
  }
  render() {
    const {
      referenceData,
      classifierSchema,
      inputValue,
      keyIsLoaded,
      referenceDataIsLoaded,
      isLoading,
      classifierElement,
      classifierSchemaIsLoaded,
      classifierSchemaError,
    } = this.state;

    const {
      data,
      modalIsOpen,
      closeModal,
      openModal,
      readOnly,
      renderOption,
      error,
      selectConfig = {},
      config,

      renderElements,
      FormComponent,
      EditButton,
      InputWrapper,
      SelectComponent,
      InlineEditor,
      LoadingComponent,
    } = this.props;

    const { FormRow } = this.context;
    const classifierId = get(data, 'id');
    const classifierData = get(data, 'data');
    const options = (referenceData || []).map(r => ({ value: r.id, label: r.title, selected: r.selected }));
    const title = get(options.find(o => o.value === classifierId), 'label');
    const optionRE = new RegExp((inputValue || '').replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'), 'i');
    const inlineEditable = get(config, ['config', 'inlineEditable']);
    const selectClassName = cx({
      [styles.classifier_error]: error,
      [styles.classifierInputWithButton]: !inlineEditable,
      [styles.classifierInput]: inlineEditable,
    });
    const passedOptions = {
      renderOption: renderOption || undefined,
      ...selectConfig,
    };

    const loadingComponentVisibility = !keyIsLoaded || !referenceDataIsLoaded;
    const editButtonVisibility = classifierSchemaIsLoaded && !inlineEditable && !classifierSchemaError;
    const inlineEditorVisibility = classifierSchemaIsLoaded && inlineEditable;

    const loadingElement = (loadingComponentVisibility && <LoadingComponent />);

    const selectElement = (
      <SelectComponent
        className={selectClassName}
        value={options.find(o => o.value === classifierId)}
        options={options.filter(o => optionRE.test(o.label))}
        isLoading={isLoading}
        onValueChange={o => this.handleClasifierChange(o ? o.value : null)}
        disabled={readOnly || isLoading}
        placeholder={'Выберите классификатор'}
        renderNoResultsFound={() => <div className="no-results-found">Ничего не найдено</div>}
        searchPromptText={'Введите строку для поиска'}
        searchingText={'Поиск'}
        blurResetsInput={false}
        search={inputValue || ''}
        onSearchChange={v => this.setState({ inputValue: v })}
        clearValueText={'Очистить'}
        formRowProps={this.props}
        manualLoadReferenceData={this.manualLoadReferenceData}
        {...passedOptions}
      />
    );

    const editButtonElement = (editButtonVisibility &&
      <EditButton
        className={styles.button}
        onClick={openModal}
        disabled={isLoading}
      />
    );

    const inlineEditorElement = (inlineEditorVisibility &&
      <InlineEditor
        config={classifierSchema}
        value={classifierData}
        onValueChange={this.handleInlineClassifierDataChange}
        readOnly={readOnly}
        FormRow={FormRow}
      />
    );

    const formEditElement = (editButtonVisibility &&
      <FormComponent
        isOpen={modalIsOpen}
        title={title}
        config={classifierSchema}
        element={classifierElement}
        data={classifierData}
        onSubmit={this.handleClassifierDataChange}
        onClose={closeModal}
        readOnly={readOnly}
      />
    );

    const elements = renderElements({
      selectElement,
      editButtonElement,
      inlineEditorElement,
      formEditElement,
      loadingElement,
    }, this.props);

    // NOTE Если просто пробрасывать пропс open, равный undefined, то выпадающий список перестанет работать автоматически
    return (
      <InputWrapper className={styles.classifier}>
        {elements}
      </InputWrapper>
    );
  }
}
