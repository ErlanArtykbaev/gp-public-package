import React, { PropTypes, Component } from 'react';
import withModal from '@gostgroup/gp-hocs/lib/withModal';

import { connect } from 'react-redux';
import { getHistory } from 'gp-core/lib/redux/modules/history';

import RfcModalHistory from './RfcModalHistory';

const modalPropTypes = {
  modalIsOpen: PropTypes.bool,
  openModal: PropTypes.func,
  closeModal: PropTypes.func,
};

@connect(
  state => state.core.history,
  { getHistory }
)
@withModal
export default class HistoryLinkComponent extends Component {

  static propTypes = {
    getHistory: PropTypes.func.isRequired,
    history: PropTypes.shape({}),
    processId: PropTypes.string,
    name: PropTypes.string,
    actionName: PropTypes.string,
    ...modalPropTypes,
  }

  openHistoryDialog = () => {
    const { openModal } = this.props;

    const processId = this.props.rowData.processId;
    this.props.getHistory(processId).then(openModal);
  }

  render() {
    const processName = this.props.data;
    const { history, closeModal, modalIsOpen } = this.props;

    return (
      <a onClick={this.openHistoryDialog}>
        {processName}
        <RfcModalHistory
          isOpen={modalIsOpen}
          historyData={history}
          onClose={closeModal}
        />
      </a>
    );
  }
}
