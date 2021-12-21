import React from 'react';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import cellPropTypes from './cell/cellPropTypes';
import './styles/recordTable.global.scss';

const RecordTableRemove = ({ data, metadata, rowData }, context) => {
  if (rowData.isNew) return null;
  return (
    <div className="record-table__submit-wrapper aui-buttons">
      <AuiButton default onClick={data ? context.onRestore : context.onRemove}>
        {data ? 'Восстановить' : 'Удалить'}
      </AuiButton>
    </div>
  );
};

RecordTableRemove.propTypes = cellPropTypes();
RecordTableRemove.contextTypes = {
  onRemove: React.PropTypes.func,
  onRestore: React.PropTypes.func,
};

export default RecordTableRemove;
