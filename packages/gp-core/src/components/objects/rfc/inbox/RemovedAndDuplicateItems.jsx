import React from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import ActionsTrashComponent from './ActionsTrashComponent';
import RfcActionNameComponent from '../RfcActionNameComponent';

const columnTrashMetadata = [
  {
    columnName: 'uuid',
    displayName: 'ID изменения',
  }, {
    columnName: 'entry',
    displayName: 'Операции',
    customComponent: ActionsTrashComponent,
  }, {
    columnName: 'actionName',
    displayName: 'Действие',
    customComponent: RfcActionNameComponent,
  },
];

export default function RemovedAndDuplicateItems({ subProcess, title }) {
  const items = [
    ...(subProcess.removedItems || []),
    ...(subProcess.dublecatesItems || []),
  ];
  if (items.length === 0) {
    return null;
  }
  return (
    <div>
      <h2>{title}</h2>
      <SimpleGriddle
        results={items}
        columnMetadata={columnTrashMetadata}
        columns={columnTrashMetadata.map(c => c.columnName)}
      />
    </div>
  );
}

RemovedAndDuplicateItems.propTypes = {
  subProcess: React.PropTypes.object,
  title: React.PropTypes.string,
};
