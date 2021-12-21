import React, { PropTypes } from 'react';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import Modal from '../Modal';

function ConfirmModal(props) {
  const { title, text, name, onClose, onSubmit } = props;
  return (
    <Modal title={title} {...props} isOpen isWidthAdaptive>
      <h4>{`${text} "${name}"?`}</h4>
      <div style={{ width: '100%', textAlign: 'center', marginTop: 10 }}>
        <button className="sh-btn btn" onClick={onSubmit}>
          Да
        </button>
        <button className="sh-btn btn" onClick={onClose} style={{ marginLeft: 20 }}>
          Нет
        </button>
      </div>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  text: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  name: PropTypes.string,
};

export default wrappedForm(ConfirmModal);
