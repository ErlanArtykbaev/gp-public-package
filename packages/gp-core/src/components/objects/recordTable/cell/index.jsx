import React from 'react';
import get from 'lodash/get';
import omit from 'lodash/omit';
import checkPermissions from '@gostgroup/gp-hocs/lib/checkPermissions';
import cellPropTypes from './cellPropTypes';
import '../styles/recordTable.global.scss';
import EditableCell from './EditableCell';
import DiffCell from './DiffCell';
import StaticCell from './StaticCell';

// Выбираем, какой вариант ячейки показать:
//  - редактирование - если:
//    - для таблицы включер режим редактирования (columnSettings.isInlineEditable === true)
//    - есть права на создание / изменение (в зависимости от заполненности),
//    - не title сохраненной записи (работает как ссылка на страницу записи)
//    - не list (по техническим причинам list не редактируется внутри таблицы);
//  - дифф: если в rowData есть diffAgainst;
//  - ничего: если нет прав на чтение;
//  - простую: во всех остальных случаях.
const Cell = (props) => {
  const { accessFields, data, metadata, rowData } = props;
  const cellProps = omit(props, 'userPermissions', 'accessFields');
  const isReadable = get(accessFields, 'isReadable', true);

  if (!isReadable) {
    return null;
  }

  const isFilledTitle = metadata.columnName === 'title' && !rowData.isNew;
  const editable = metadata.isInlineEditable && !isFilledTitle && (
    metadata.type !== 'list'
  );

  if (editable) {
    const filled = data !== undefined;
    const isUpdatable = get(accessFields, 'isUpdatable', true);
    const isCreatable = get(accessFields, 'isCreatable', true);
    const disabledByAccess = (!filled && !isCreatable) || (filled && !isUpdatable);
    const disabled = props.disabled || disabledByAccess;

    if (!disabled) {
      return <EditableCell {...cellProps} />;
    }
  }

  // TODO eliminate rowData, it breaks purity
  return (
    <div className="table-cell" style={{ backgroundColor: rowData.color }}>
      {metadata.isDiff && rowData.diffAgainst
        ? <DiffCell {...cellProps} />
        : <StaticCell {...cellProps} />
      }
    </div>
  );
};

Cell.propTypes = cellPropTypes();

export default checkPermissions(Cell);
