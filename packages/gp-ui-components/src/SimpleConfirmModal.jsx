import React from 'react';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import Modal from './Modal';

@wrappedForm
export default class SimpleConfirmModal extends React.Component {
  render() {
    const { isOpen, onClose, infoOnly, content, onAccept, acceptText = 'ОК',
      onCancel, cancelText = 'Закрыть' } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        onClose={onClose}
        cancelButton={!infoOnly}
        cancelButtonTitle={cancelText}
        onCancel={onCancel}
        saveButton
        saveButtonTitle={acceptText}
        onSubmit={onAccept}
        noHeader
        closeTimeoutMS={150}
        isWidthAdaptive
      >
        <div>
          <div>
            {content}
          </div>
        </div>
      </Modal>
    );
  }
}
