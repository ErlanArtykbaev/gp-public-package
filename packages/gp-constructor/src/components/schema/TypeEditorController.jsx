import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Immutable from 'immutable';
import TypeEditor from './TypeEditor';
import { createNewType } from '../../models/type.js';
import { updateObjectName, updateObjectId } from '../../models/common.js';

@autobind
export default class TypeEditorController extends React.Component {

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
    onSchemaImport: PropTypes.func,
  }

  onChange(type) {
    const cursor = this.props.cursor();
    let index = cursor.get('types').findIndex(t => t.get('uuid') === type.get('uuid'));

    if (index > -1) {
      cursor.update('types', types => types.set(index, type));
    } else {
      index = cursor.get('global').findIndex(t => t.get('uuid') === type.get('uuid'));
      if (index > -1) {
        cursor.update('global', types => types.set(index, type));
      }
    }
  }

  setSchema(type, properties, result) {
    let cursor = this.props.cursor();
    const importTypes = result.schema.types;
    importTypes.forEach((src) => {
      const types = cursor.get('types');
      let targ = createNewType(types);
      targ = updateObjectName(targ, src.title);
      targ = updateObjectId(targ, src.id);
      // targ = targ.set('properties', Immutable.fromJS(src.config.properties));
      targ = this.props.container.store.getTypeWithImportedProperties(targ, src.config.properties, cursor);
      cursor = cursor.update('types', t => t.push(targ));
      // type = type.set('title', {error: null, value: t.title}).set('id', {error: null, value: t.id});
    });
    const importedType = this.props.container.store.getTypeWithImportedProperties(type, properties, cursor);
    this.onChange(importedType);
    if (typeof this.props.onSchemaImport === 'function') {
      this.props.onSchemaImport(this.props.cursor());
    }
  }

  render() {
    const props = this.props;
    const cursor = props.cursor();
    const selected = cursor.get('selected');
    let types = cursor.get('types').deref();
    let globalTypes = cursor.get('global').deref();
    globalTypes = globalTypes.toJS();
    for (let i = 0; i < globalTypes.length; i++) {
      globalTypes[i].isGlobal = true;
    }
    globalTypes = Immutable.fromJS(globalTypes);
    types = types.concat(globalTypes);


    const type = types.find(t => t.get('uuid') === selected);

    if (!type) {
      return <div />;
    }

    return (
      <TypeEditor
        type={type}
        cursor={cursor}
        checkValidate={this.props.checkValidate}
        onChange={this.onChange}
        mainData={this.props.container.main_data}
        onDisabledChange={this.props.onDisabledChange}
        onSchemaImport={this.setSchema}
        isMutable={this.props.isMutable}
      />
    );
  }

}
