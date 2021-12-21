import React, { PropTypes, Component } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import SimpleConfirmModal from '@gostgroup/gp-ui-components/lib/SimpleConfirmModal';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import { getProcessActionNameTypeWithObjectTitle } from '@gostgroup/gp-utils/lib/util.js';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as inboxActions from 'gp-core/lib/redux/modules/rfc/inbox';

import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import RfcViewEntryPanel from '../../RfcViewEntryPanel';
import RfcDuplicationCompareDialog from './RfcDuplicationCompareDialog';

class StatusComponent extends Component {

  render() {
    const row = this.props.rowData;

    return (
      <span
        className={`aui-lozenge aui-lozenge-${
        row.status === 'YELLOW' ? 'current' : 'error'}`}
      >
        {row.status === 'YELLOW' ? 'Желтый' : 'Красный'}
      </span>
    );
  }
}

@connect(
  null,
  dispatch => ({ actions: bindActionCreators(inboxActions, dispatch) }),
)
class ActionsComponent extends Component {

  static propTypes = {
    actions: PropTypes.shape({
      setDuplicate: PropTypes.func,
      setNotDuplicate: PropTypes.func,
      setDublicateExistItem: PropTypes.func,
    }),
    rowData: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    this.dublicate = this.dublicate.bind(this);
    this.notDublicate = this.notDublicate.bind(this);

    this.state = {
      openRfcCompareModal: false,
    };
  }

  dublicateExistItem(item1, item2) {
    const { actions } = this.props;

    this.setState({
      confirmModal: {
        content: (
          <span>
            Изменение будет преобразовано в редактирование версии. <br />
            В случае импорта из внешней системы, после завершения процесса, будет создана запись в перекодировочной таблице.
          </span>
        ),
        onAccept: () => {
          actions.setDublicateExistItem(item1, item2);
        },
        onCancel: () => {
          this.setState({ confirmModal: null });
        },
      },
    });
  }

  dublicate(item1, item2) {
    const { actions } = this.props;
    actions.setDuplicate(item1.uuid, item2.uuid, item1.subProcessId);
  }

  notDublicate(item1, item2) {
    const { actions } = this.props;
    actions.setNotDuplicate(item1.uuid, item2.uuid, item1.subProcessId);
  }

  render() {
    const row = this.props.rowData;

    let buttonsActions = null;
    if (!row.item2.savedEntry) {
      buttonsActions = [
        <AuiButton onClick={() => this.dublicate(row.item1, row.item2)}>Дубликат</AuiButton>,
        <AuiButton onClick={() => this.notDublicate(row.item1, row.item2)}>НЕ дубликат</AuiButton>,
        <AuiButton onClick={() => this.setState({ openRfcCompareModal: true })}>Сравнить</AuiButton>,
      ];
    } else if (row.item1.entry.externalId) {
      buttonsActions = [
        <AuiButton onClick={() => this.dublicateExistItem(row.item1, row.item2)}>
          Признать дубликатом вносимое изменение
        </AuiButton>,
        <AuiButton onClick={() => this.setState({ openRfcCompareModal: true })}>Сравнить</AuiButton>,
      ];
    } else {
      buttonsActions = [
        <AuiButton onClick={() => this.setState({ openRfcCompareModal: true })}>Сравнить</AuiButton>,
      ];
    }

    return (
      <div>
        <p className="aui-buttons">
          {buttonsActions}
        </p>
        <RfcDuplicationCompareDialog
          isOpen={this.state.openRfcCompareModal}
          onClose={() => this.setState({ openRfcCompareModal: false })}
          item1={row.item1}
          item2={row.item2}
        />
        <SimpleConfirmModal
          isOpen={!!this.state.confirmModal}
          {...this.state.confirmModal}
        />
      </div>
    );
  }
}

const columnMetadata = [
  {
    columnName: 'uuid',
    displayName: 'ID изменения',
  },
  {
    columnName: 'status',
    displayName: 'Статус',
    customComponent: StatusComponent,
  },
  {
    columnName: 'meta',
    displayName: 'Информация',
  },
  {
    columnName: 'action',
    displayName: 'Действия',
    customComponent: ActionsComponent,
  },
];

const columns = [
  'uuid',
  'status',
  'meta',
  'action',
];

export default class RfcDuplicationDialog extends Component {

  render() {
    const { meta, item, duplicationItems } = this.props;
    const excessDuplicationItems = [];
    if (duplicationItems) {
      const ids = [];
      for (let i = 0; i < duplicationItems.length; i++) {
        if (ids.indexOf(duplicationItems[i].rfcDraftProcessId) == -1) {
          excessDuplicationItems.push(duplicationItems[i]);
          ids.push(duplicationItems[i].rfcDraftProcessId);
        }
      }
    }

    let modalTitle = '';
    let content = <p />;
    if (item) {
      modalTitle = `Дедупликация по дейсвию "${getProcessActionNameTypeWithObjectTitle(item)}"`;
      content = (
        <div>
          <h2>Общая информация о дубликате:</h2>
          <form className="aui top-label">
            <div className="field-group top-label">
              <label>ID изменения:</label>
              <span>{item.rfcDraftProcessId}</span>
            </div>
            <div className="field-group top-label">
              <label>Тип изменения:</label>
              <span>{getProcessActionNameTypeWithObjectTitle(item)}</span>
            </div>
            <div className="field-group top-label">
              <label>Статус:</label>
              <span
                className={`aui-lozenge aui-lozenge-${
                meta.status == 'YELLOW' ? 'current' : 'error'}`}
              >
                {meta.status == 'YELLOW' ? 'Желтый' : 'Красный'}
              </span>
              <div className="field-group top-label">
                <label>Информация:</label>
                <span>{`${meta.meta} (c коэффициентом ${meta.deduplicationResult})`}</span>
              </div>
            </div>
          </form>
          <h2>Изменение:</h2>
          <RfcViewEntryPanel
            schema={item.entry.element.schema}
            entry={item.entry}
            data={item.entry.version.object}
            fullTitle={item.entry.fullTitle}
            shortTitle={item.entry.title}
            startDate={item.entry.version.dateStart}
            endDate={item.entry.version.dateEnd}
            readOnly
          />
          <h2>Список дубликатов:</h2>
          <SimpleGriddle
            results={excessDuplicationItems}
            columnMetadata={columnMetadata}
            columns={columns}
          />
        </div>
      );
    }
    return (
      <Modal
        title={modalTitle}
        {...this.props}
      >
        {content}
      </Modal>
    );
  }
}
