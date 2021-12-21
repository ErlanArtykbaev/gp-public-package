import React, { PropTypes } from 'react';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import BaseRecordModal from './RecordModal';

const RecordModal = wrappedForm(BaseRecordModal);

@withModal
export default class RecordWrapper extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    record: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    closeModal: PropTypes.func,
    openModal: PropTypes.func,
    modalIsOpen: PropTypes.bool,
  }

  render() {
    const { openModal, closeModal, modalIsOpen } = this.props;
    return (
      <div>
        <AuiButton onClick={openModal}>Показать запись</AuiButton>
        <RecordModal {...this.props} isOpen={modalIsOpen} onClose={closeModal} />
      </div>
    );
  }
}
