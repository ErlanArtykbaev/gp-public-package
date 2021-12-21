import React, { PropTypes } from 'react';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import BaseChangesModal from './ChangesModal';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

const ChangesModal = wrappedForm(BaseChangesModal);

@withModal
export default class History extends React.Component {

  static propTypes = {
    record: PropTypes.object,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
    modalIsOpen: PropTypes.bool,
    splat: PropTypes.string,
  }

  render() {
    const { openModal, closeModal, modalIsOpen } = this.props;
    return (
      <div>
        <AuiButton onClick={openModal}>Посмотреть историю изменений</AuiButton>
        <ChangesModal {...this.props} splat={this.props.splat} record={this.props.record} isOpen={modalIsOpen} onClose={closeModal} />
      </div>
    );
  }
}
