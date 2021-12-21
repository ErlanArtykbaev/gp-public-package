import React from 'react';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import cellPropTypes from './cell/cellPropTypes';
import './styles/recordTable.global.scss';

const RecordTableSubmit = ({ data, metadata, rowData }, context) => {
  if (data === 'clean' && !rowData.isNew) return null;
  return (
    <div className="record-table__submit-wrapper aui-buttons">
      <AuiButton primary disabled={data === 'invalid'} onClick={context.onSubmit}>
        Сохранить
      </AuiButton>
      <AuiButton onClick={context.onAbort}>Отменить</AuiButton>
    </div>
  );
};

RecordTableSubmit.propTypes = cellPropTypes();
RecordTableSubmit.contextTypes = {
  onSubmit: React.PropTypes.func,
  onAbort: React.PropTypes.func,
};

export default RecordTableSubmit;
