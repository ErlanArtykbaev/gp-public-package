import React from 'react';

const StatusComponent = ({ rowData }) =>
  <span className={`aui-lozenge aui-lozenge-${rowData.statusClass}`}>{rowData.statusName}</span>
;

export default StatusComponent;
