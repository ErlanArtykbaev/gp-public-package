import React from 'react';
import { mixin } from './mixin.js';

// позволяет менять местами элементы в списке
// вызывает props.onChange передавая туда измененный список
const MovableList = (listProp) => {
  function swap(list, i, j) {
    if (i < 0 || i > list.size) return list;
    if (j < 0 || j >= list.size) return list;

    const a = list.get(i);
    const b = list.get(j);

    list = list.set(i, b);
    list = list.set(j, a);

    return list;
  }

  return mixin({
    onMoveUp(i) {
      const props = this.props;
      const list = props[listProp];

      props.onChange(swap(list, i, i - 1));
    },
    onMoveDown(i) {
      const props = this.props;
      const list = props[listProp];

      props.onChange(swap(list, i, i + 1));
    },
  });
};

export default MovableList;
