import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getImmutableRefs } from 'gp-core/lib/redux/selectors/objects';
import * as baseElementActions from 'gp-core/lib/redux/modules/element';
import createElement from '@gostgroup/gp-models/lib/element';

import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import isEqual from 'lodash/isEqual';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import EditorWrapper from './EditorWrapper';

function disabled(state) {
  const { valid_data } = state;
  return Object.values(valid_data).filter(t => t === false).length > 0;
}

@connect(
  state => ({
    immutableRefs: getImmutableRefs(state),
    globalTypes: state.core.element.globalTypes,
    editorStateIsValid: state.core.editor.valid,
  }),
  dispatch => ({
    elementActions: bindActionCreators(baseElementActions, dispatch),
  })
)
@wrappedForm
@autobind
export default class NewElementModal extends Component {

  static propTypes = {
    item: PropTypes.object,
    schema: PropTypes.object,
    onClose: PropTypes.func,
    element: PropTypes.object,
    globalTypes: PropTypes.arrayOf(PropTypes.shape({})),
    readOnly: PropTypes.bool,
    onGlobalTypeSave: PropTypes.func,
    onSubmit: PropTypes.func,
    immutableRefs: PropTypes.shape({}),
    elementActions: PropTypes.shape({}),
    editorWrapperProps: PropTypes.shape({}),
    titleType: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      valid_data: {
        main_data: !!props.schema,
        deduplication_data: true,
      },
      warning: false,
      confirmCloseModalOpen: false,
    };
  }

  componentDidMount() {
    const { elementActions } = this.props;
    // elementActions.getGlobalTypes();
  }

  onDisabledChange(isDisabled) {
    this.setState({ disabled: isDisabled });
  }

  onCloseConfirm() {
    this.setState({ warning: false });
    this.props.onClose();
  }

  onCloseReject() {
    this.setState({ warning: false });
  }

  onCloseWithConfirm() {
    // проверка main_data и schema на изменение
    let main_data;
    let { schema } = this.props;
    const { element } = this.props;
    const isNewElement = !element;

    const editor_schema = this.editor.getSchema();
    const editor_main_data = this.editor.getMainData();

    if (isNewElement) {
      main_data = createElement();
      schema = this.editor.getSchema(this.editor.getClearSchema());
    } else {
      main_data = createElement(element);
    }


    const schemaHasChanged = !isEqual(schema, editor_schema);
    const mainDataHasChanged = !isEqual(main_data, editor_main_data);

    if (mainDataHasChanged || schemaHasChanged) {
      this.setState({ warning: true });
    } else {
      this.props.onClose();
    }
  }

  onClose() {
    try {
      this.onCloseWithConfirm();
    } catch (err) {
      this.setState({ warning: true });
    }
  }

  // устанавливает валидность данных
  checkValidate(key, valid) {
    const { valid_data } = this.state;
    valid_data[key] = valid;

    this.setState({ valid_data });
  }

  handleSubmit() {
    const schema = this.editor.getSchema();
    const main_data = this.editor.getMainData();
    const { item, element } = this.props;
    schema.config.properties.map((property) => { // add own key for hierarchical
      if (property.type === 'reference' && property.config.isHierarchical) {
        let ownKey;
        if (item && item.absolutPath) {
          ownKey = `${item.absolutPath}/${main_data.key}`;
        } else if (element) {
          ownKey = element.absolutPath;
        }
        property.config.key = ownKey;
      }
      return property;
    });

    this.props.onSubmit({ schema, main_data });
  }

  handleGlobalTypeSave() {
    const schema = this.editor.getGlobalSchema();
    this.props.onGlobalTypeSave(schema);
  }

  setEditorNode(node) {
    if (!this.editor) {
      this.editor = node.getWrappedInstance();
    }
  }

  render() {
    const { element, immutableRefs,
      globalTypes, editorWrapperProps, titleType } = this.props;
    const title = `${(element ? 'Редактирование' : 'Создание')} ${titleType}`;

    // if (!globalTypes) return null;

    return (
      <Modal
        title={title}
        isOpen
        {...this.props}
        warning={this.state.warning}
        onClose={this.onClose}
        onCloseConfirm={this.onCloseConfirm}
        onCloseReject={this.onCloseReject}
        onSubmit={this.handleSubmit}
        saveButton={!this.props.readOnly}
        saveButtonDisabled={disabled(this.state) || this.state.disabled || !this.props.editorStateIsValid}
      >
        <EditorWrapper
          ref={this.setEditorNode}
          readOnly={this.props.readOnly}
          refs={immutableRefs}
          schema={this.props.schema}
          checkValidate={this.checkValidate}
          onDisabledChange={this.onDisabledChange}
          globalTypes={globalTypes}
          element={element}
          valid_data={this.state.valid_data}
          onGlobalTypeSave={this.handleGlobalTypeSave}
          warning={this.toggleWarning}
          {...(editorWrapperProps || {})}
        />
      </Modal>
    );
  }

}
