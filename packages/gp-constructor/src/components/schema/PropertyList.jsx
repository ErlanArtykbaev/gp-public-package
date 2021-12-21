import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropertyEditor from './PropertyEditor';
import PropertyEditorHeading from './PropertyEditorHeading';
import { createNewProperty, cloneProperty } from '../../models/property.js';
import { DeletableList, MovableList } from '../../decorators';

@MovableList('properties')
@DeletableList('properties')
@autobind
export default class PropertyList extends React.Component {

  static propTypes = {
    properties: ImmutablePropTypes.list.isRequired,
    type: ImmutablePropTypes.map,
    nameType: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onDisabledChange: PropTypes.func,
    cursor: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      showForm: false,
      property: null,
    };
  }

  renderProperties({ properties, nameType }) {
    const editors = properties.map((p, i) => (
      <div key={p.get('uuid')} className="panel panel-default" style={{ height: '100%' }}>
        <PropertyEditorHeading
          onDelete={this.onDelete.bind(this, i)}
          onMoveUp={this.onMoveUp.bind(this, i)}
          onMoveDown={this.onMoveDown.bind(this, i)}
          onDuplicate={() => this.onDuplicate(p)}
          onChange={item => this.onItemChange(item, i)}
          property={p}
        />
        {!p.get('collapsed') &&
          <PropertyEditor
            nameType={nameType}
            property={p}
            properties={properties}
            onChange={item => this.onItemChange(item, i)}
            onPropertyClick={this.handlePropertyClick}
            onDisabledChange={this.props.onDisabledChange}
          />
        }
      </div>
      ));
    return editors.toJS();
  }

  handlePropertyClick(property, selectedPropertyIndex, selectedTypeUUID) {
    let newProperty = false;
    if (!property) {
      const cursor = this.props.cursor;
      let type = cursor.get('types').find(t => t.get('uuid') === selectedTypeUUID);
      if (!type) type = cursor.get('global').find(t => t.get('uuid') === selectedTypeUUID);
      const properties = type.get('properties');
      property = createNewProperty(properties, type.get('isMutable'));
      selectedPropertyIndex = properties.size;
      newProperty = true;
    }
    this.setState({ showForm: true, property, selectedPropertyIndex, selectedTypeUUID, newProperty });
  }


  handleSubmit() {
    const { property, selectedTypeUUID, selectedPropertyIndex } = this.state;
    const typesListCursor = this.props.cursor;
    let selectedTypeIndex = typesListCursor.get('types').findIndex(t => t.get('uuid') === selectedTypeUUID);
    if (selectedTypeIndex !== -1) {
      typesListCursor.update('types', types => types.setIn([selectedTypeIndex, 'properties', selectedPropertyIndex], property));
    } else {
      selectedTypeIndex = typesListCursor.get('global').findIndex(t => t.get('uuid') === selectedTypeUUID);
      typesListCursor.update('global', types => types.setIn([selectedTypeIndex, 'properties', selectedPropertyIndex], property));
    }
    this.setState({ showForm: false });
  }

  handlePropertyDelete() {
    const { property, selectedTypeUUID, selectedPropertyIndex } = this.state;
    const typesListCursor = this.props.cursor;
    const selectedTypeIndex = typesListCursor.get('types').findIndex(t => t.get('uuid') === selectedTypeUUID);
    typesListCursor.update('types', types => types.deleteIn([selectedTypeIndex, 'properties', selectedPropertyIndex], property));
    this.setState({ showForm: false });
  }

  addProperty() {
    const { type, properties } = this.props;
    const newProp = createNewProperty(properties, type.get('isMutable'));
    this.props.onChange(properties.map(p => p.set('collapsed', true)).push(newProp));
  }

  onItemChange(p, i) {
    const properties = this.props.properties;

    this.props.onChange(properties.set(i, p));
  }

  onDuplicate(p) {
    const properties = this.props.properties;
    const newProp = cloneProperty(p, properties);
    this.props.onChange(properties.push(newProp));
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          Свойства
        </div>
        <div className="panel-body">
          {this.renderProperties(this.props)}

          <button
            onClick={this.addProperty}
            type="button"
            className="btn btn-default"
          >
            Добавить свойство
          </button>
        </div>
      </div>
    );
  }

}
