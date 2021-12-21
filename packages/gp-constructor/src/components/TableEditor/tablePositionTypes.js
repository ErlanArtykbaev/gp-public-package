import Immutable from 'immutable';

const tableTypePositionTypes = Immutable.fromJS([
  { id: 'row', title: 'Ряд' },
  // { id: 'column', title: 'Колонка' },
  { id: 'cell', title: 'Клетка' },
]);


const referencePositionTypes = Immutable.fromJS([
  { id: 'row', title: 'Ряд' },
  { id: 'column', title: 'Колонка' },
  { id: 'nav', title: 'Панель навигации' },
]);


export {
  tableTypePositionTypes,
  referencePositionTypes,
};
