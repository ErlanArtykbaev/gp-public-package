import React, { PropTypes, Component } from 'react';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import SimpleRfcModalHistory from './SimpleRfcModalHistory';

const modalPropTypes = {
  modalIsOpen: PropTypes.bool,
  openModal: PropTypes.func,
  closeModal: PropTypes.func,
};

@withModal
export default class SimpleHistoryLinkComponent extends Component {

  static propTypes = {
    getHistory: PropTypes.func.isRequired,
    history: PropTypes.shape({}),
    processId: PropTypes.string,
    name: PropTypes.string,
    actionName: PropTypes.string,
    ...modalPropTypes,
  }

  openHistoryDialog = () => {
    const { processId, getHistory, openModal } = this.props;

    getHistory(processId).then(openModal);
  }

  render() {
    const { name, actionName, history } = this.props;
    const { modalIsOpen, closeModal } = this.props;

    return (
      <a className="link-hand-cursor" onClick={this.openHistoryDialog} >
        { name }
        <SimpleRfcModalHistory
          isOpen={modalIsOpen}
          historyData={history}
          actionName={actionName}
          onClose={closeModal}
        />
      </a>
    );
  }
}
