import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import EditorWrapper from '@gostgroup/gp-core/lib/components/objects/EditorWrapper';

import { connect } from 'react-redux';
import { getImmutableRefs } from '@gostgroup/gp-core/lib/redux/selectors/objects';

import Modal from '@gostgroup/gp-ui-components/lib/Modal';

@connect(
  state => ({
    immutableRefs: getImmutableRefs(state),
  })
)
@autobind
export default class SchemaEditorModal extends React.Component {

  setEditorNode(node) {
    if (!this.editor) {
      this.editor = node.getWrappedInstance();
    }
  }

  handleSubmit() {
    const schema = this.editor.getSchema();
    const { onSubmit } = this.props;

    onSubmit(schema);
  }

  render() {
    const { isOpen, onClose, schema = {}, element, readOnly, immutableRefs } = this.props;
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={this.handleSubmit}
        saveButton={!readOnly}
        title="Схема классификатора"
      >
        <EditorWrapper
          ref={this.setEditorNode}
          element={element}
          refs={immutableRefs}
          checkValidate={() => true}
          schema={schema}
          useGlobalTypes={false}
          availableContexts={['schemaDataContext']}
          valid_data={{}}
          readOnly={readOnly}
          disabledTypes={['classifier_schema', 'classifier']}
          clearSchema
        />
      </Modal>
    );
  }
}

SchemaEditorModal.propTypes = {
  immutableRefs: PropTypes.shape({}),
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  schema: PropTypes.shape({}),
  isOpen: PropTypes.bool,
  element: PropTypes.shape({}),
  readOnly: PropTypes.bool,
};
