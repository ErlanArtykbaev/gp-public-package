import React, { PropTypes } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';

const GoToComponent = ({ rowData }) => (
  <p className="aui-buttons">
    <AuiButton onClick={() => window.open(`/#/records/${rowData.path}`, '_blank')}>Открыть запись</AuiButton>
  </p>
);

GoToComponent.propTypes = {
  rowData: PropTypes.shape({}),
};

const meta = [
  {
    columnName: 'element',
    displayName: 'Справочник',
  },
  {
    columnName: 'timestamp',
    displayName: 'Время проверки',
  },
  {
    columnName: 'type',
    displayName: 'Тип проверки',
  },
  {
    columnName: 'info',
    displayName: 'Информация',
  },
  {
    columnName: 'error',
    displayName: 'Ошибка',
  },
  {
    columnName: 'path',
    displayName: 'Действия',
    customComponent: GoToComponent,
  },
];

const cols = [
  'element',
  'type',
  'timestamp',
  'info',
  'error',
  'path',
];

export default function CheckResultModal(props) {
  const { errors } = props;
  return (
    <Modal
      title={'Результаты проверки'}
      {...props}
    >
      <SimpleGriddle
        results={errors}
        columnMetadata={meta}
        columns={cols}
      />
    </Modal>
  );
}

CheckResultModal.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.shape({})),
};
