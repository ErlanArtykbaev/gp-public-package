import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import ExportEditor from './ExportEditor';
import { createNewType } from '../../models/export.js';
import { updateObjectName, updateObjectId } from '../../models/common.js';

@autobind
export default class ExportEditorController extends React.Component {

  static propTypes = {
    cursor: PropTypes.func.isRequired,
    container: PropTypes.shape({
      store: PropTypes.shape({
        getTypeWithImportedProperties: PropTypes.func,
      }),
      main_data: PropTypes.shape({}),
    }),
    isMutable: PropTypes.bool,
    checkValidate: PropTypes.func,
    onDisabledChange: PropTypes.func,
    selected:PropTypes.string,
  }

  static contextTypes = {
    container: PropTypes.object,
    rule: PropTypes.object,
  }

  onChange(exportTemplate) {
    const cursor = this.props.cursor();
    const index = this.props.cursor(['exportTemplates']).findIndex(t => t.get('uuid') === exportTemplate.get('uuid'));

    if (index > -1) {
      cursor.update(exportTemplates => exportTemplates.set(index, exportTemplate));
    }
  }

  render() {
    const props = this.props;
    const cursor = props.cursor();
    const selected = props.selected;
    const exportTemplates = this.props.cursor(['exportTemplates']);
    const exportTemplate = exportTemplates.find(t => t.get('uuid') === selected);

    if (!exportTemplate) {
      return <div />;
    }

    return (
      <ExportEditor
        exportTemplate={exportTemplate}
        cursor={cursor}
        checkValidate={this.props.checkValidate}
        onChange={this.onChange}
        mainData={this.props.container.main_data}
        onDisabledChange={this.props.onDisabledChange}
        isMutable={this.props.isMutable}
      />
    );
  }

}
