import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { SortableContainer, arrayMove } from 'react-sortable-hoc';
import Immutable from 'immutable';
import BaseTypeList from './TypeList';
import { createNewType, cloneType } from '../../models/type.js';

const TypeList = SortableContainer(props => <BaseTypeList {...props} />); // eslint-disable-line new-cap

@autobind
export default class TypeListController extends React.Component {

  static propTypes = {
    cursor: PropTypes.func.isRequired,
    main_data: PropTypes.shape({}).isRequired,
  }

  componentDidMount() {
    // если тип не выбран, то выбирается первый тип
    const cursor = this.props.cursor();
    if (!cursor.get('selected')) {
      this.onSelect(cursor.getIn(['types', 0]));
    }
  }

  onAdd() {
    const cursor = this.props.cursor();
    const types = cursor.get('types').deref();
    const type = createNewType(types);

    cursor.update('types', t => t.push(type))
          .update('selected', () => type.get('uuid'));
  }

  onChange(types) {
    this.props.cursor().update('types', () => types);
  }

  onSelect(t) {
    const cursor = this.props.cursor();
    cursor.update('selected', () => t.get('uuid'));
  }

  onDuplicate(type) {
    const cursor = this.props.cursor();
    const types = cursor.get('types').deref();
    const clonedType = cloneType(type, types);

    cursor.update('types', t => t.push(clonedType));
  }

  onMakeMain(type) {
    const cursor = this.props.cursor();

    cursor.update('types', (types) => {
      const index = types.findIndex(t => t.get('main'));
      const oldMain = types.get(index).set('main', false).set('isDeletable', true);
      types = types.set(index, oldMain);

      const newIndex = types.findIndex(t => t.get('uuid') === type.get('uuid'));
      const newMain = types.get(newIndex).set('main', true).set('isDeletable', false);
      types = types.set(newIndex, newMain);

      return types;
    });
  }

  onSortEnd({ oldIndex, newIndex }) {
    const cursor = this.props.cursor();
    cursor.update('types', types => Immutable.fromJS(arrayMove(types.toJS(), oldIndex, newIndex)));
  }

  render() {
    const cursor = this.props.cursor();

    return (
      <TypeList
        types={cursor.get('types').deref()}
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
