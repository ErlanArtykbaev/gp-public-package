import React, { Component } from 'react';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import RfcViewEntryPanel from '../../RfcViewEntryPanel';

export default class RfcDuplicationCompareDialog extends Component {

  render() {
    const { item1, item2, status, info } = this.props;

    let modalTitle = '';
    let content = <p />;
    if (item1 && item2) {
      modalTitle = 'Сравнение дубликатов';
      content = (<div className="aui-group aui-group">
        <div className="aui-item">
          <h2>Данные из изменения</h2>
          <RfcViewEntryPanel
            schema={item1.entry.element.schema}
            entry={item1.entry}
            data={item1.entry.version.object}
            fullTitle={item1.entry.fullTitle}
            shortTitle={item1.entry.title}
            startDate={item1.entry.version.dateStart}
            endDate={item1.entry.version.dateEnd}
            readOnly
          />
        </div>
        <div className="aui-item">
          <h2>Данные, с которыми производится сравнение</h2>
          <RfcViewEntryPanel
            schema={item1.entry.element.schema}
            entry={item2.entry}
            data={item2.entry.version.object}
            fullTitle={item2.entry.fullTitle}
            shortTitle={item2.entry.title}
            startDate={item2.entry.version.dateStart}
            endDate={item2.entry.version.dateEnd}
            readOnly
          />
        </div>
      </div>);
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
