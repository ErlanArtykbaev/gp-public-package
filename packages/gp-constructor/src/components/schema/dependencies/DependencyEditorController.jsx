import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import DependencyEditor from './DependencyEditor';
import { createNewDependency } from '../../../models/dependency.js';
import { updateObjectName, updateObjectId } from '../../../models/common.js';
import createPropertiesTree from './createPropertiesTree';

@autobind
export default class DependencyEditorController extends React.Component {

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
  }

  static contextTypes = {
    container: PropTypes.object,
    rule: PropTypes.object,
  }

  state = {
    properties: [],
  }

  async componentWillMount() {
    const properties = await createPropertiesTree(this.context.container.store.getSchema());

    this.setState({ properties });
  }

  onChange(dependency) {
    const cursor = this.props.cursor();
    const index = cursor.get('dependencies').findIndex(t => t.get('uuid') === dependency.get('uuid'));

    if (index > -1) {
      cursor.update('dependencies', dependencies => dependencies.set(index, dependency));
    }
  }

  setSchema(dependency, properties, result) {
    let cursor = this.props.cursor();
    const importDependencies = result.schema.dependencies;
    importDependencies.forEach((src) => {
      const dependencies = cursor.get('dependencies');
      let targ = createNewDependency(dependencies);
      targ = updateObjectName(targ, src.title);
      targ = updateObjectId(targ, src.id);
      targ = targ.set('properties', src.config.properties);
      cursor = cursor.update('dependencies', t => t.push(targ));
    });
    const importedDependency = this.props.container.store.getTypeWithImportedProperties(dependency, properties, cursor);
    this.onChange(importedDependency);
  }

  render() {
    const props = this.props;
    const cursor = props.cursor();
    const selected = cursor.get('selected');
    const dependencies = cursor.get('dependencies').deref();
    const dependency = dependencies.find(t => t.get('uuid') === selected);

    if (!dependency) {
      return <div />;
    }

    return (
      <DependencyEditor
        dependency={dependency}
        cursor={cursor}
        checkValidate={this.props.checkValidate}
        onChange={this.onChange}
        mainData={this.props.container.main_data}
        onDisabledChange={this.props.onDisabledChange}
        onSchemaImport={this.setSchema}
        isMutable={this.props.isMutable}
        properties={this.state.properties}
      />
    );
  }

}
