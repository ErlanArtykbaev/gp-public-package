import React from 'react';
import Select from 'react-select';
import styles from './SingleFilter.scss';

const operations = [
  {
    key: 'equals',
    title: 'Равно',
  },
  {
    key: 'gt',
    title: 'Больше чем',
  },
  {
    key: 'lt',
    title: 'Меньше чем',
  },
  {
    key: 'like',
    title: 'Содержит',
  },
];

export default props => (
  <Select
    className={styles.select}
    {...props}
    placeholder={'Выберите условие'}
    searchable={false}
    options={operations.map(op => ({ value: op.key, label: op.title }))}
  />
);
