import React from 'react';
import { autobind } from 'core-decorators';
import Immutable from 'immutable';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import Input from '../ui/Input';
import FilterListInput from '../ui/FilterListInput';
import PropertyList from './PropertyList';
import { updateObjectName, updateObjectId } from '../../models/common.js';

@autobind
export default class TypeEditor extends React.Component {

  static propTypes = {
    type: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.state = {};
  }

  submitScheme(jsonScheme) {
    const result = JSON.parse(jsonScheme);

    if (result && result.schema && result.schema.config && result.schema.config.properties) {
      this.props.onSchemaImport(this.props.type, result.schema.config.properties, result);
      // this.props.onChange(this.props.type.set('properties', Immutable.fromJS(result.schema.config.properties)));
      global.NOTIFICATION_SYSTEM.notify('Информация', 'Схема данных импортирована успешно.', 'info');
    } else {
      global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Файл содержит ошибки в формировании схемы', 'error');
    }
  }

  readJson(e) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onload = (upload) => {
      this.submitScheme(upload.target.result);
    };
    reader.readAsText(file);
  }

  onNameChange(newName) {
    const props = this.props;

    const newPropType = updateObjectName(props.type, newName);
    props.onChange(newPropType);
    this.checkValidate(newPropType);
  }

  onIdChange(newId) {
    const props = this.props;

    const newPropType = updateObjectId(props.type, newId);
    props.onChange(newPropType);
    this.checkValidate(newPropType);
  }

  onPropertiesChange(properties) {
    this.props.onChange(this.props.type.set('properties', properties));
  }

  onChange(key, value) {
    this.props.onChange(this.props.type.set(key, Immutable.fromJS(value)));
  }

  onConfigChange(key, value) {
    this.props.onChange(this.props.type.setIn(['config', key], Immutable.fromJS(value)));
  }

  checkValidate(propType) {
    const idError = propType.getIn(['id', 'error']);
    const titleError = propType.getIn(['title', 'error']);
    const isValid = (!idError && !titleError);
    this.props.checkValidate('schema_data', isValid);
  }

  renderBody({ type, disabled }) {
    const id = type.get('id');
    const name = type.get('title');
    const properties = type.get('properties');
    const isMain = this.props.type.get('main');
    const isLocal = this.props.type.get('isGlobal') !== true;
    const nameType = isMain && isLocal ? this.props.mainData.shortTitle : name.get('value');

    return (
      <div>
        <form>
          <Input
            value={isMain && isLocal ? this.props.mainData.key : id.get('value')}
            error={id.get('error')}
            label="Идентификатор типа"
            onChange={this.onIdChange}
            disabled={isMain && isLocal}
          />

          <Input
            value={nameType}
            error={name.get('error')}
            label="Имя типа"
            onChange={this.onNameChange}
            disabled={isMain && isLocal}
          />

          {isMain &&
            <Input
              type="bool"
              label="Всегда отображать фильтры"
              value={type.getIn(['config', 'hasStaticFilters'])}
              onChange={v => this.onConfigChange('hasStaticFilters', v)}
            />
          }
          {type.getIn(['config', 'hasStaticFilters']) &&
            <FilterListInput
              value={type.getIn(['config', 'staticFilters']) ? type.getIn(['config', 'staticFilters']).toJS() : []}
              onChange={f => this.onConfigChange('staticFilters', f)}
              properties={properties.map(p => p.get('original')).toJS()}
            />
          }

          <PropertyList
            type={type}
            cursor={this.props.cursor}
            nameType={nameType}
            properties={properties}
            onChange={this.onPropertiesChange}
            onDisabledChange={this.props.onDisabledChange}
          />

          <Div hidden={!this.props.isMutable}>
            <a onClick={() => this.refs.schemaImportInput.click()} className="pointer">
              Импорт схемы данных в формате JSON
            </a>
            <input
              ref="schemaImportInput"
              style={{ display: 'none' }}
              type="file" accept=".json"
              onChange={this.readJson}
            />
          </Div>
        </form>
      </div>
    );
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          Тип данных
        </div>
        <div className="panel-body">
          <div>
            {this.renderBody(this.props)}
          </div>
        </div>
      </div>
    );
  }

}
