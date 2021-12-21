import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import get from 'lodash/get';
import Input from '../ui/Input';
import Select from '../ui/select';
import { updateObjectName, updateObjectId } from '../../models/common.js';
import types, { typesMap, PRIMITIVE_TYPES } from '../../types.js';
import PropertyTypeEditor from './PropertyTypeEditor';

export default class PropertyEditor extends React.Component {

  static propTypes = {
    onPropertyClick: PropTypes.func,
    onChange: PropTypes.func,
    onDisabledChange: PropTypes.func,
    property: PropTypes.object,
    nameType: PropTypes.string,
    properties: PropTypes.object,
    hideFields: PropTypes.arrayOf(PropTypes.string),
  }

  static contextTypes = {
    container: PropTypes.object,
  }

  onIdChange(newId) {
    this.props.onChange(updateObjectId(this.props.property, newId));
  }

  onNameChange(newName) {
    this.props.onChange(updateObjectName(this.props.property, newName));
  }

  onTypeChange(newType) {
    const defaultConfig = get(typesMap, `${newType}.defaultConfig`, {});

    this.props.onChange(
      this.props.property
        .set('type', newType)
        .set('typeConfig', new Immutable.Map(defaultConfig))
    );
  }
  onCopyValueFieldChange(target) {
    this.handleChangeConfig('copyValueField', target);
  }

  handleChange(key, value) {
    this.props.onChange(this.props.property.set(key, value));
  }

  handleChangeConfig(key, value) {
    this.props.onChange(this.props.property.setIn(['typeConfig', key], value));
  }

  handlePropertyClick(property, index, selectedTypeUUID) {
    this.props.onPropertyClick(property, index, selectedTypeUUID);
  }

  isEditableByAdminChangable() {
    const { container } = this.context;
    return container.permissions.includes('super_user') || container.permissions.includes('hard_admin');
  }

  render() {
    const { container } = this.context;
    const { disabledTypes = [] } = container;
    const { property, hideFields, properties } = this.props;
    const id = property.get('id');
    const name = property.get('title');
    const type = property.get('type');
    const typeConfig = property.get('typeConfig');
    const isRequired = property.get('required');
    const isUnique = property.get('unique');
    // TODO useStyles свойство нужно перенести в typeEditor, потому что его использует только geojson
    const useStyles = property.get('useStyles');
    const isPrimitive = PRIMITIVE_TYPES.includes(type);
    const editableByAdminOnly = property.get('editableByAdminOnly');
    const copyValueOn = typeConfig.get('copyValueOn');
    const copyValueField = typeConfig.get('copyValueField');
    const typesOptions = types.map(t => ({ value: t.get('id'), label: t.get('title') }))
      .toJS()
      .filter(option => !disabledTypes.includes(option.value));
    const copyFieldOptions = properties.toJS().map(p => ({ value: p.id.value, label: p.title.value }))
      .filter(option => id.toJS().value !== option.value);
    const showField = field => !hideFields || !hideFields.includes(field);

    return (
      <div className="panel-body">

        {showField('id') && (<Input
          value={id.get('value')}
          error={id.get('error')}
          label="Идентификатор свойства"
          onChange={this.onIdChange.bind(this)}
          disabled={!property.get('isMutable')}
        />)}

        {showField('name') && (<Input
          value={name.get('value')}
          error={name.get('error')}
          label="Имя свойства"
          onChange={this.onNameChange.bind(this)}
        />)}

        {(showField('required') && !(type === 'uuid' || type === 'bool')) && (
        <Input
          type="bool"
          value={type === 'uuid' ? false : isRequired}
          label="Обязательное"
          onChange={this.handleChange.bind(this, 'required')}
          disabled={property.get('isRequireChangable') === false}
        />)}

        {(showField('unique') && isPrimitive) && (<Input
          type="bool"
          value={isUnique}
          label="Уникальное"
          onChange={this.handleChange.bind(this, 'unique')}
          disabled={property.get('isUniqueChangeable') === false}
        />)}

        {(showField('useStyles') && type === 'geojson') && (<Input
          type="bool"
          value={useStyles}
          label="Использовать стили"
          onChange={this.handleChange.bind(this, 'useStyles')}
          disabled={!property.get('isMutable')}
        />)}

        {showField('editableByAdminOnly') && (<Input
          type="bool"
          value={editableByAdminOnly}
          label="Редактируется администратором"
          onChange={this.handleChange.bind(this, 'editableByAdminOnly')}
          disabled={!this.isEditableByAdminChangable()}
        />)}

        {showField('type') && (<Select
          value={type}
          label="Тип данных"
          options={typesOptions}
          onChange={this.onTypeChange.bind(this)}
          disabled={!property.get('isMutable')}
        />)}

        {showField('copyValueOn') && copyFieldOptions.length > 0 && (<Input
          type="bool"
          value={copyValueOn}
          label="Копировать данные при вводе"
          onChange={this.handleChangeConfig.bind(this, 'copyValueOn')}
        />)}

        {copyValueOn && copyFieldOptions.length > 0 && (<Select
          type="bool"
          value={copyValueField}
          options={copyFieldOptions}
          label="Куда копировать"
          onChange={this.onCopyValueFieldChange.bind(this)}
        />)}

        {showField('typeConfig') && (<PropertyTypeEditor
          type={type}
          nameType={this.props.nameType}
          properties={this.props.properties}
          property={property}
          value={typeConfig}
          onPropertyClick={this.handlePropertyClick.bind(this)}
          onChange={this.handleChange.bind(this, 'typeConfig')}
          disabled={!property.get('isMutable')}
          onDisabledChange={this.props.onDisabledChange}
        />)}

      </div>
    );
  }

}
