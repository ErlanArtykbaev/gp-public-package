import React, { PropTypes } from 'react';
import Select from 'react-select';
import styles from './SingleFilter.scss';

export default function PropertySelector(props) {
  const { properties, value, disabled, onChange } = props;
  const options = properties.map(p => ({ value: p.id, label: p.title }));
  return (
    <Select
      className={styles.select}
      value={value}
      disabled={disabled}
      onChange={onChange}
      options={options}
      placeholder={'Выберите свойство'}
      noResultsText={'Ничего не найдено'}
      searchPromptText={'Введите строку для поиска'}
      searchingText={'Поиск'}
      clearValueText={'Очистить'}
    />
  );
}

PropertySelector.propTypes = {
  properties: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
  })),
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
