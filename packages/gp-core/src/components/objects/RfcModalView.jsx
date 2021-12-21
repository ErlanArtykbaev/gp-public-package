import React, { Component } from 'react';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import RfcViewEntryPanel from './RfcViewEntryPanel';

export default class RfcModalView extends Component {

  render() {
    const { entry, schema, data, fullTitle, shortTitle, startDate, endDate, readOnly, modalTitle, rfcProcessId, element } = this.props;

    return (
      <Modal
        title={modalTitle}
        {...this.props}
      >
        <RfcViewEntryPanel
          schema={schema}
          entry={entry}
          data={data}
          fullTitle={fullTitle}
          shortTitle={shortTitle}
          startDate={startDate}
          endDate={endDate}
          rfcProcessId={rfcProcessId}
          readOnly={readOnly}
        />
      </Modal>
    );
  }
}
