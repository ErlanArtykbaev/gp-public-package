import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { SortableContainer, arrayMove } from 'react-sortable-hoc';
import Immutable from 'immutable';
import BaseDependencyList from './DependencyList';
import { createNewDependency, cloneDependency } from '../../../models/dependency.js';

const DependencyList = SortableContainer(props => <BaseDependencyList {...props} />); // eslint-disable-line new-cap

@autobind
export default class DependencyListController extends React.Component {

  static propTypes = {
    cursor: PropTypes.func.isRequired,
    main_data: PropTypes.shape({}).isRequired,
  }

  componentDidMount() {
    // если тип не выбран, то выбирается первый тип
    const cursor = this.props.cursor();
    if (!cursor.get('selected')) {
      this.onSelect(cursor.getIn(['dependencies', 0]));
    }
  }

  onAdd() {
    const cursor = this.props.cursor();
    const dependencies = cursor.get('dependencies').deref();
    const dependency = createNewDependency(dependencies);

    cursor.update('dependencies', t => t.push(dependency))
          .update('selected', () => dependency.get('uuid'));
  }

  onChange(dependencies) {
    this.props.cursor().update('dependencies', () => dependencies);
  }

  onSelect(t) {
    const cursor = this.props.cursor();
    cursor.update('selected', () => t.get('uuid'));
  }

  onDuplicate(dependency) {
    const cursor = this.props.cursor();
    const dependencies = cursor.get('dependencies').deref();
    const clonedType = cloneDependency(dependency, dependencies);

    cursor.update('dependencies', t => t.push(clonedType));
  }

  onMakeMain(dependency) {
    const cursor = this.props.cursor();

    cursor.update('dependencies', (dependencies) => {
      const index = dependencies.findIndex(t => t.get('main'));
      const oldMain = dependencies.get(index).set('main', false).set('isDeletable', true);
      dependencies = dependencies.set(index, oldMain);

      const newIndex = dependencies.findIndex(t => t.get('uuid') === dependency.get('uuid'));
      const newMain = dependencies.get(newIndex).set('main', true).set('isDeletable', false);
      dependencies = dependencies.set(newIndex, newMain);

      return dependencies;
    });
  }

  onSortEnd({ oldIndex, newIndex }) {
    const cursor = this.props.cursor();
    cursor.update('dependencies', dependencies => Immutable.fromJS(arrayMove(dependencies.toJS(), oldIndex, newIndex)));
  }

  render() {
    const cursor = this.props.cursor();

    return (
      <DependencyList
        dependencies={cursor.get('dependencies').deref()}
        selectedTypeId={cursor.get('selected')}
        onAdd={this.onAdd}
        onChange={this.onChange}
        onSelect={this.onSelect}
        onDuplicate={this.onDuplicate}
        onMakeMain={this.onMakeMain}
        main_data={this.props.main_data}
        // hideSortableGhost={false}
        pressDelay={100}
        onSortEnd={this.onSortEnd}
      />
    );
  }

}
