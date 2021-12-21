import React from 'react';
import { mixin } from './mixin.js';

// позволяет удалять элементы в списке
// вызывает props.onChange передавая туда измененный список
const DeletableList = listProp => mixin({
    // TODO сделать static декоратор
    // propTypes: {
    //   onChange: React.PropTypes.func,
    //   [listProp]: React.PropTypes.object.isRequired
    // },
  onDelete(index) {
    const props = this.props;
    const list = props[listProp];

    props.onChange(list.remove(index));
  },
});

export default DeletableList;
