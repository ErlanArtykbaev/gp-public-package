import React from 'react';
import GlobalTypeList from './GlobalTypeList';
import { createNewType, cloneType } from '../../models/type.js';


export default class GlobalTypeListController extends React.Component {

  constructor() {
    super();
  }

  render() {
    const cursor = this.props.cursor();

    return (
      <GlobalTypeList
        types={cursor.get('global').deref()}
        selectedTypeId={cursor.get('selected')}
        onAdd={this.onAdd.bind(this)}
        onChange={this.onChange.bind(this)}
        onSelect={this.onSelect.bind(this)}
        onDuplicate={this.onDuplicate.bind(this)}
        onGlobalTypeSave={this.onGlobalTypeSave.bind(this)}
        readonly={!!this.props.readOnly}
      />
    );
  }

  onAdd() {
    const cursor = this.props.cursor();
    const types = cursor.get('global').deref();
    const type = createNewType(types);

    cursor.update('global', t => t.push(type))
          .update('selected', () => type.get('uuid'));
  }

  onChange(types) {
    this.props.cursor().update('global', () => types);
  }

  onSelect(t) {
    const cursor = this.props.cursor();
    cursor.update('selected', () => t.get('uuid'));
  }

  onDuplicate(type) {
    const cursor = this.props.cursor();
    const types = cursor.get('global').deref();
    const clonedType = cloneType(type, types);

    cursor.update('global', t => t.push(clonedType));
  }

  onGlobalTypeSave() {
    this.props.container.onGlobalTypeSave();
  }


}
