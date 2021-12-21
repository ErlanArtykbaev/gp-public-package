import React, { PropTypes, Component } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import { getProcessActionNameType } from '@gostgroup/gp-utils/lib/util.js';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';

import { connect } from 'react-redux';
import { getRfcHistoryElement } from 'gp-core/lib/redux/modules/history';

import { formatDate, deepFormatDate } from '../utils';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import ProcessHistoryLinkComponent from '../rfc/ProcessHistoryLinkComponent';
import SubProcessHistoryLinkComponent from '../rfc/SubProcessHistoryLinkComponent';
import RfcActionNameComponent from '../rfc/RfcActionNameComponent';
import NewElementModal from '../NewElementModal';
import RfcModalView from '../RfcModalView';
import ViewGroupModal from '../ViewGroupModal';

class ActionsComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      rfcModalOpen: false,
    };
  }

  editElementModalOpen() {
    this.setState({ rfcModalOpen: true });
  }

  render() {
    const entry = this.props.data;
    const row = this.props.rowData;
    const readOnly = true;
    let button;
    let viewDialog;

    if (row.endDate && row.statusClass === 'success' && row.savedEntry) {
      button = (
        <AuiButton onClick={() => window.location.href = `/#/records/${row.savedEntry.absolutPath}?version=${row.savedEntry.version.id}`}>
          Перейти к записи
        </AuiButton>
      );
    } else {
      button = (
        <AuiButton onClick={() => this.editElementModalOpen()}>
          Просмотр
        </AuiButton>
      );
    }

    if (row.entry) {
      viewDialog = (
        <RfcModalView
          isOpen={this.state.rfcModalOpen}
          schema={entry.element.schema}
          data={entry.version.object}
          fullTitle={entry.fullTitle}
          shortTitle={entry.title}
          startDate={entry.version.dateStart}
          endDate={entry.version.dateEnd}
          readOnly={readOnly}
          modalTitle={getProcessActionNameType(row.type)}
          entry={entry}
          rfcProcessId={row.subProcessId}
          onClose={() => this.setState({ rfcModalOpen: false })}
        />
      );
    } else if (row.element) {
      viewDialog = (
        <NewElementModal
          title={`${getProcessActionNameType(row.type)} "${row.element.schema.title}"`}
          isOpen={this.state.rfcModalOpen}
          readOnly={readOnly}
          onClose={() => this.setState({ rfcModalOpen: false })}
          schema={row.element.schema}
          element={row.element}
        />
      );
    } else if (row.tree) {
      viewDialog = (
        <ViewGroupModal
          title={`${getProcessActionNameType(row.type)} "${row.tree.shortTitle}"`}
          isOpen={this.state.rfcModalOpen}
          onClose={() => this.setState({ rfcModalOpen: false })}
          data={row.tree}
        />
      );
    }

    return (
      <p className="aui-buttons">
        {button}
        {viewDialog}
      </p>
    );
  }
}

const columnMetadata = [
  {
    columnName: 'entry',
    displayName: 'Действия',
    customComponent: ActionsComponent,
  },
  {
    columnName: 'actionName',
    displayName: 'Действие',
    customComponent: RfcActionNameComponent,
  },
];

const columns = [
  'actionName',
  'entry',
];

@connect(
  state => ({
    historyElement: state.core.history.historyElement,
  }),
  { getRfcHistoryElement },
)
@wrappedForm
export default class HistoryModal extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      date: PropTypes.string,
      dateStart: PropTypes.string,
      time: PropTypes.string,
    }).isRequired,
    getRfcHistoryElement: PropTypes.func.isRequired,
    historyElement: PropTypes.shape({
      uuid: PropTypes.string,
      name: PropTypes.string,
      user: PropTypes.string,
      dateStart: PropTypes.string,
      dateEnd: PropTypes.string,
      currentTaskName: PropTypes.string,
      subProcesses: PropTypes.arrayOf(PropTypes.shape({})),
      processId: PropTypes.string,
      statusClass: PropTypes.string,
      statusName: PropTypes.string,
    }),
  }

  componentDidMount() {
    const { data } = this.props;
    this.props.getRfcHistoryElement(data.uuid);
  }

  getSubProcessesDiv(subProcesses) {
    const divs = subProcesses.map((subProcess, index) =>
      <div key={index}>
        <form className="aui top-label">
          <div className="field-group top-label">
            <label>Наимемнование процесса:</label>
            <span>{subProcess.processName}</span>
          </div>
          {subProcess.currentTaskName ?
            <div className="field-group top-label">
              <label>Текущая задача:</label>
              <span>{subProcess.currentTaskName}</span>
            </div> : ''}
          {subProcess.currentAssignement ?
            <div className="field-group top-label">
              <label>Ответственный за этап:</label>
              <span>{subProcess.currentAssignement}</span>
            </div> : ''}
          <div className="field-group top-label">
            <label>Дата начала:</label>
            <span>{formatDate(subProcess.startDate)}</span>
          </div>
          <div className="field-group top-label">
            <label>Дата завершения:</label>
            <span>{formatDate(subProcess.endDate)}</span>
          </div>
          <div className="field-group top-label">
            <label>Статус:</label>
            <span className={`aui-lozenge aui-lozenge-${subProcess.statusClass}`}>{subProcess.statusName}</span>
          </div>
          <div className="field-group top-label">
            <h4 className="link-hand-cursor">
              <SubProcessHistoryLinkComponent
                name="Посмотреть историю процесса"
                processId={subProcess.id}
              />
            </h4>
          </div>
        </form>
        <SimpleGriddle
          results={subProcess.items}
          columnMetadata={columnMetadata}
          columns={columns}
        />
      </div>
    );

    return (
      <div style={{ margin: 5 }}>
        <h3>Список изменений, сгруппированный по процессам</h3>
        {divs}
      </div>
    );
  }

  render() {
    const changeFrom = this.props.data.date || this.props.data.time || this.props.data.dateStart;
    const { historyElement } = this.props;
    if (historyElement.uuid) {
      return (
        <Modal title={`Изменение от ${formatDate(changeFrom)}`} {...this.props}>
          <div>
            <form className="aui top-label">
              <div className="rfc-process-name-background">
                <h2>{deepFormatDate(historyElement.name)}</h2>
              </div>
              <div className="field-group top-label">
                <label>Пользователь, создавший заявку:</label>
                <span>{historyElement.user}</span>
              </div>
              <div className="field-group top-label">
                <label>Дата отправки запроса:</label>
                <span>{formatDate(historyElement.dateStart)}</span>
              </div>
              <div className="field-group top-label">
                <label>Дата завершения рассмотрения запроса:</label>
                <span>{formatDate(historyElement.dateEnd)}</span>
              </div>
              {historyElement.currentTaskName ?
                <div className="field-group top-label">
                  <label>Текущая задача:</label>
                  <span>{historyElement.currentTaskName}</span>
                </div> : ''}
              <div className="field-group top-label">
                <label>Статус:</label>
                <span className={`aui-lozenge aui-lozenge-${historyElement.statusClass}`}>{historyElement.statusName}</span>
              </div>
              <div className="field-group top-label">
                <h4 className="link-hand-cursor">
                  <ProcessHistoryLinkComponent
                    name="Посмотреть историю запроса"
                    processId={historyElement.processId}
                  />
                </h4>
              </div>
            </form>

            {this.getSubProcessesDiv(historyElement.subProcesses)}

            <hr className="rfc-border-line" />
          </div>
        </Modal>
      );
    }
    return (
      <Modal title={`Изменение от ${formatDate(this.props.data.time)}`} {...this.props}>
        <div>
          Загрузка...
        </div>
      </Modal>
    );
  }
}
