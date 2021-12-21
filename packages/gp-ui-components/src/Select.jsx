import React, { PropTypes } from 'react';
import { SimpleSelect } from 'react-selectize';

class Select extends React.Component {
  render() {
    return <SimpleSelect {...this.props} />;
  }
}

const SelectOption = PropTypes.shape({
  value: PropTypes.any,
  label: PropTypes.string,
});

/* eslint-disable */
Select.propTypes = {
  className: PropTypes.string,                    // css-класс
  value: SelectOption,                            // значение или null
  options: PropTypes.arrayOf(SelectOption),       // массив значений для выбора
  isLoading: PropTypes.bool,                      // отображать ли лоадер
  onValueChange: PropTypes.func,                  // (SelectOption) => {} функция которая вызывается при выборе из списка
  disabled: PropTypes.bool,                       // дисейблить ли инпут
  placeholder: PropTypes.string,                  // плейсхолдер
  search: PropTypes.string,                       // строка по которой ищем (отображается в инпуте)
  onSearchChange: PropTypes.func,                 // (search) => {} функция которая вызывается на изменение вводимой строки
  clearValueText: PropTypes.string,               // текст для контрола, очищающего значение
  searchPromptText: PropTypes.string,             // текст для указания что делать чтобы искать
  searchingText: PropTypes.string,                // текст отображающийся в компоненте с опциями во время поиска
  renderNoResultsFound: PropTypes.func,           // компонент, который рендерится в компоненте с опциями в случае отсетствия результатов
};
/* eslint-enable */

const NoResultsFoundComponent = () => <div className="no-results-found">Ничего не найдено</div>;
Select.defaultProps = {
  placeholder: 'Выберите...',
  searchPromptText: 'Введите строку для поиска',
  searchingText: 'Поиск...',
  clearValueText: 'Очистить',
  renderNoResultsFound: NoResultsFoundComponent,
};

export default Select;
