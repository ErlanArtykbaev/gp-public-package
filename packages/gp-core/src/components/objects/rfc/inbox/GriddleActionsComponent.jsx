import React from 'react';
import ActionsComponent from './ActionsComponent';

export default p => (
  <ActionsComponent rfc={p.rowData.$$rfcMeta} page={p.page} entry={p.data} />
);
