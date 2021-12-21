import React from 'react';
import get from 'lodash/get';
import { hasValidationErrors } from '@gostgroup/gp-utils/lib/util.js';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

export default function SubProcessButtons({ subProcess, onAction }) {
  // проверка на наличие дублей
  const hasRedDuplications = get(subProcess, ['deduplicationInfo', 'analyzedMeta'], [])
    .some(analyzedMeta => analyzedMeta.status === 'RED');

  const isValid = !hasRedDuplications && !hasValidationErrors(subProcess);
  const availActions = isValid
    ? subProcess.actions
    : subProcess.actions.filter(action => ['delete', 'reject', 'admin-reject'].includes(action.id));

  return (
    <form className="aui top-label">
      <div className="field-group top-label">
        <label><h2>Действия</h2></label>
        <div className="aui-buttons">
          {!isValid &&
            <h3 className="rfc-red">
              Для выполнения действий необходимо избавиться от дублирующихся
              записей и ошибок валидации
            </h3>
          }
          {availActions.map(action =>
            <AuiButton
              type="button"
              key={action.uuid}
              onClick={() => onAction(action)}
            >{action.name}</AuiButton>
          )}
        </div>
      </div>
    </form>
  );
}

SubProcessButtons.propTypes = {
  subProcess: React.PropTypes.object,
  onAction: React.PropTypes.func,
};
