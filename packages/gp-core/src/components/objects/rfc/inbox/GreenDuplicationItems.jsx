import React from 'react';
import map from 'lodash/map';
import { Link } from 'react-router';
import groupBy from 'lodash/groupBy';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import { getProcessActionColorType, RFC_ACTIONS, isDiffableRfcElement } from '@gostgroup/gp-utils/lib/util.js';
import ElementDiff from 'gp-core/lib/components/objects/element/diff';

import RecordTable from '../../recordTable';
import ActionsComponent from './ActionsComponent';
import GriddleActionsComponent from './GriddleActionsComponent';
import RfcActionNameComponent from '../RfcActionNameComponent';
import RfcActionTypeComponent from '../RfcActionTypeComponent';
import RfcActionCommentComponent from '../RfcActionCommentComponent';

const columnBaseMetadata = [
  {
    columnName: 'uuid',
    displayName: 'ID изменения',
  },
  {
    columnName: 'entry',
    displayName: 'Операции',
    customComponent: GriddleActionsComponent,
  },
];

// Для операций с записями
const recordDiffMetadata = columnBaseMetadata.concat(
  {
    columnName: 'type',
    displayName: 'Действие',
    customComponent: RfcActionTypeComponent,
  },
  {
    columnName: 'description',
    displayName: 'Комментарий',
    customComponent: RfcActionCommentComponent,
  }
);
const restDiffMetadata = columnBaseMetadata.concat({
  columnName: 'actionName',
  displayName: 'Действие',
  customComponent: RfcActionNameComponent,
});

export default function GreenDuplicationItems({ title, items, diffAgainst, currentElements }) {
  const results = items.items ? items.items : items;
  const isTablable = r => RFC_ACTIONS.RECORD.indexOf(r.type) !== -1;
  const extractVersion = r => r.entry.version ? r.entry.version.object : {};

  const recordDiff = results.filter(isTablable);
  const elementDiff = results.filter(i => isDiffableRfcElement(i.type));
  const restDiff = results.filter(r => !isTablable(r) && !isDiffableRfcElement(r.type)).map(r => ({ ...r, $$rfcMeta: r }));
  const multiMode = [recordDiff, elementDiff, restDiff].filter(block => block.length > 0).length > 1;

  const recordsShaped = recordDiff.map((r) => {
    r.description = r.entry.element.description;
    return ({
      $$rfcMeta: r,
      $$rfcEntry: r.entry,
      ...extractVersion(r),
      $$meta: r.entry,
    });
  });
  const recordDiffByElement = map(
    groupBy(recordsShaped, rfc => rfc.$$rfcMeta.entry.element.absolutPath),
    records => ({ element: records[0].$$rfcMeta.entry.element, records })
  );

  return (
    <div>
      <h2>{title}</h2>

      {(multiMode && recordDiff.length > 0) && <h3>Изменение записей</h3>}
      {(recordDiffByElement || []).map(({ element, records }) => (
        <div key={element.absolutPath}>
          <h3>Запись справочника <Link to={`/elements/${element.absolutPath}`}>{element.fullTitle}</Link></h3>
          <RecordTable
            data={records}
            titleLink={false}
            schema={element.schema}
            absolutPath={element.absolutPath}
            date={null}
            paintFn={rec => getProcessActionColorType(rec.$$rfcMeta.type)}
            diffAgainst={diffAgainst}
            metaCols={{ $$rfcMeta: recordDiffMetadata }}
          />
        </div>
      ))}

      {(multiMode && elementDiff.length > 0) && <h3>Изменение справочников</h3>}
      {(elementDiff || []).map(el => (
        <div key={el.element.absolutPath}>
          <ElementDiff
            curr={currentElements[el.element.absolutPath]}
            next={el.element}
          />
          <ActionsComponent rfc={el} page={0} entry={el.entry} />
        </div>
      ))}

      {(multiMode && restDiff.length > 0) && <h3>Другие изменения</h3>}
      {restDiff.length > 0 && <SimpleGriddle
        results={restDiff}
        columnMetadata={restDiffMetadata}
        columns={restDiffMetadata.map(c => c.columnName)}
      />}
    </div>
  );
}

GreenDuplicationItems.propTypes = {
  items: React.PropTypes.object,
  title: React.PropTypes.string,
  diffAgainst: React.PropTypes.object,
  currentElements: React.PropTypes.object,
};
