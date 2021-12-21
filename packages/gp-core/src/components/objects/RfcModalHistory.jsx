import React from 'react';
import { getProcessActionNameByEntry } from '@gostgroup/gp-utils/lib/util.js';
import StatusComponent from '@gostgroup/gp-ui-components/lib/StatusComponent';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import SimpleRfcModalHistory from './rfc/SimpleRfcModalHistory';
import RfcViewEntryPanel from './RfcViewEntryPanel';

export default class RfcModalHistory extends SimpleRfcModalHistory {

  render() {
    const { historyData } = this.props;

    const tabsDivs = historyData.history.map((historyItem, i) =>
      <div id={`tab-id-${historyItem.uuid}`} className={i === 0 ? 'tabs-pane active-pane' : 'tabs-pane'} role="tabpanel" aria-hidden={i === 0 ? 'false' : 'true'}>
        <h2>{`Этап "${historyItem.startActionName}"`}</h2>
        <h3>Данные НСИ на момент этапа</h3>
        <RfcViewEntryPanel
          schema={historyItem.entry.element.schema}
          entry={historyItem.entry}
          data={historyItem.entry.version.object}
          fullTitle={historyItem.entry.fullTitle}
          shortTitle={historyItem.entry.title}
          startDate={historyItem.entry.version.dateStart}
          endDate={historyItem.entry.version.dateEnd}
          readOnly
        />
        <h3>Атрибуты этапа изменения</h3>
        <form className="aui top-label">
          <div className="field-group top-label">
            <label>Время начала этапа:</label>
            <span>{historyItem.startTime}</span>
          </div>
          <div className="field-group top-label">
            <label>Время завершения этапа:</label>
            <span>{historyItem.endTime}</span>
          </div>
          <div className="field-group top-label">
            <label>Пользователь, запустивший этап:</label>
            <span>{historyItem.startUserId}</span>
          </div>
          <div className="field-group top-label">
            <label>Пользователь, получивший задачу после завершения этапа:</label>
            <span>{historyItem.endUserId}</span>
          </div>
        </form>
        <img role="presentation" src={`data:image/png;base64,${historyItem.diagram}`} />
      </div>
    );

    return (
      <Modal
        title={'История процесса'}
        {...this.props}
      >
        <form className="aui top-label">
          <div className="field-group top-label">
            <label>Имя процесса:</label>
            <span>{historyData.processName}</span>
          </div>
          <div className="field-group top-label">
            <label>Текущая задача:</label>
            <span>{historyData.currentTaskName}</span>
          </div>
          <div className="field-group top-label">
            <label>Действие:</label>
            <span>{getProcessActionNameByEntry(historyData.entry)}</span>
          </div>
          <div className="field-group top-label">
            <label>Дата старта процесса:</label>
            <span>{historyData.startDate}</span>
          </div>
          <div className="field-group top-label">
            <label>Дата завершения процесса:</label>
            <span>{historyData.endDate}</span>
          </div>
          <div className="field-group top-label">
            <label>Статус:</label>
            <StatusComponent rowData={historyData} />
          </div>
        </form>
        <h2>Этапы процесса</h2>
        <div className="aui-tabs horizontal-tabs" role="application">
          {this.renderHistoryItemList(historyData)}
          {tabsDivs}
        </div>
      </Modal>
    );
  }
}
