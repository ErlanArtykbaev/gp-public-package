import React, { PropTypes, Component } from 'react';
import withModal from '@gostgroup/gp-hocs/lib/withModal';

import { connect } from 'react-redux';
import { getRestoredAtomicRfc, restoreAtomicRfc } from 'gp-core/lib/redux/modules/rfc/restore';

import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import SimpleConfirmModal from '@gostgroup/gp-ui-components/lib/SimpleConfirmModal';

const content = (
  <span>
    <h2>ВНИМАНИЕ</h2>
    Система будет возвращена в состояние на момент до утверждения ЗНИ. <br />
    Данное действие невозможно отменить.
  </span>
);

const ActionsComponent = props => (
  <div>
    <p className="aui-buttons">
      <AuiButton onClick={props.openModal}>Откат</AuiButton>
    </p>
    <SimpleConfirmModal
      isOpen={props.modalIsOpen}
      content={content}
      onAccept={() => props.restore(props.rowData.uuid)}
      onCancel={props.closeModal}
    />
  </div>
);

ActionsComponent.propTypes = {
  openModal: PropTypes.func,
  closeModal: PropTypes.func,
  modalIsOpen: PropTypes.bool,
  restore: PropTypes.func.isRequired,
  rowData: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
};

const columnMetadata = [
  {
    columnName: 'name',
    displayName: 'Название ЗНИ',
  },
  {
    columnName: 'startDate',
    displayName: 'Дата формирования ЗНИ',
  },
  {
    columnName: 'endDate',
    displayName: 'Дата утверждения ЗНИ',
  },
  {
    columnName: 'uuid',
    displayName: 'Уникальный идентификатор',
  },
  {
    columnName: 'actions',
    displayName: 'Действия',
    customComponent: connect(null, { restore: restoreAtomicRfc })(
      withModal(ActionsComponent)
    ),
  },
];

const columns = [
  'uuid',
  'name',
  'startDate',
  'endDate',
  'actions',
];

@connect(
  state => state.core.rfc.restore,
  { getItems: getRestoredAtomicRfc },
)
export default class RfcRestoreHandler extends Component {

  static propTypes = {
    items: PropTypes.array,
    getItems: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { getItems } = this.props;
    getItems();
  }

  render() {
    const { items } = this.props;

    return (
      <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
        <h2>Откат утвержденных ЗНИ</h2>
        <SimpleGriddle
          results={items}
          columnMetadata={columnMetadata}
          columns={columns}
        />
      </div>
    );
  }
}
