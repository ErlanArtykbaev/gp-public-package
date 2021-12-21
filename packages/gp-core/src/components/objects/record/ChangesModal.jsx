import React, { PropTypes } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import HistoryModal from './HistoryModal';
import RecordWrapper from './RecordWrapper';
import { formatDate, deepFormatDate } from '../utils';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

const columnMetadata = [
  {
    columnName: 'changeTime',
    displayName: 'Время изменения',
  },
  {
    columnName: 'orderName',
    displayName: 'Название заявки',
  },
  {
    columnName: 'zniView',
    displayName: 'ЗНИ',
  },
  {
    columnName: 'recordView',
    displayName: 'Запись',
  },
];

const columns = [
  'changeTime',
  'orderName',
  'zniView',
  // 'recordView',
];

export default class ChangesModal extends React.Component {

  static propTypes = {
    record: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      historyModalIsOpen: false,
      rfc: null,
    };
  }

  showRfcHistory(rfc) {
    this.setState({
      rfc,
      historyModalIsOpen: true,
    });
  }

  render() {
    if (this.props.record) {
      if (!this.props.record.rfcs) {
        return (
          <Modal title={'Изменения'} {...this.props} >
            <div>
              История отсутствует
            </div>
          </Modal>
        );
      }
      const rfcs = this.props.record.rfcs.map(rfc => ({
        changeTime: <div>{formatDate(rfc.time)}</div>,
        orderName: <div>{deepFormatDate(rfc.rfcName)}</div>,
        zniView: <AuiButton onClick={this.showRfcHistory.bind(this, rfc)}>Показать ЗНИ</AuiButton>,
        recordView: <div><RecordWrapper {...this.props} versionId={this.props.versionId} record={rfc.current} splat={this.props.splat} /></div>,
      }));
      return (
        <Modal title={'Изменения'} {...this.props}>
          <SimpleGriddle
            results={rfcs}
            columnMetadata={columnMetadata}
            columns={columns}
          />
          {this.state.historyModalIsOpen && <HistoryModal
            data={this.state.rfc}
            isOpen={this.state.historyModalIsOpen}
            onClose={() => this.setState({ historyModalIsOpen: false })}
          />}
        </Modal>
      );
    }
    return (
      <Modal title={'Изменения'} {...this.props} >
        <div>
          Загрузка...
        </div>
      </Modal>
    );
  }
}
