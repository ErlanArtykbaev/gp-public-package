import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Select from 'react-select';
import cx from 'classnames';

// import { TYPES } from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/types';
import { updateObjectName, updateObjectId } from '../../models/common';
import styles from './ExportEditor.scss';

const FILES_FORMATS = [
  {
    id: 'XLSX',
    label: 'XLSX',
    value: 'XLSX',
  },
  {
    id: 'DOCX',
    label: 'DOCX',
    value: 'DOCX',
  },
  {
    id: 'PDF',
    label: 'PDF',
    value: 'PDF',
  },
  {
    id: 'HTML',
    label: 'HTML',
    value: 'HTML',
  },
];

@autobind
export default class ExportEditor extends React.Component {

  static propTypes = {
    exportTemplate: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    checkValidate: PropTypes.func,
    // properties: PropTypes.arrayOf(PropTypes.shape({})),
  }

  onNameChange(newName) {
    const props = this.props;

    const newPropType = updateObjectName(props.exportTemplate, newName);
    props.onChange(newPropType);
    this.checkValidate(newPropType);
  }

  onIdChange(newId) {
    const props = this.props;

    const newPropType = updateObjectId(props.exportTemplate, newId);
    props.onChange(newPropType);
    this.checkValidate(newPropType);
  }

  onPropertyChange(fieldName, value) {
    value = value.replace(/"/g, '\'');
    const exportTemplate = this.props.exportTemplate.set(fieldName, value);
    this.props.onChange(exportTemplate);
  }


  checkValidate(propType) {
    const idError = propType.getIn(['id', 'error']);
    const titleError = propType.getIn(['title', 'error']);
    const isValid = (!idError && !titleError);
    this.props.checkValidate('schema_data', isValid);
  }

  renderBody({ exportTemplate }) {
    const name = exportTemplate.get('title');
    const nameType = name.get('value');

    return (
      <div className={styles.export_template}>
        <form className="aui form gost-nsi-form container-fluid">
          <div className="field-group">
            <label htmlFor="title" >Наименование</label>
            <input
              className="text input--text"
              value={nameType}
              onChange={e => this.onNameChange(e.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="format" >Формат</label>
            <Select
              className="Ref-Select"
              value={exportTemplate.get('format')}
              options={FILES_FORMATS}
              clearable={false}
              placeholder={'Выбрать'}
              onChange={value => this.onPropertyChange('format', value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="template" >Шаблон Jasper</label>
            <textarea
              className={cx('textarea', 'input--textarea', styles.textarea)}
              rows="17"
              value={exportTemplate.get('template')}
              onChange={e => this.onPropertyChange('template', e.target.value)}
            />
          </div>
        </form>
      </div>
    );
  }

  render() {
    return (
      <div className={cx('panel', 'panel-default', styles.panel)} >
        <div className="panel-body">
          <div>
            {this.renderBody(this.props)}
          </div>
        </div>
      </div>
    );
  }

}
