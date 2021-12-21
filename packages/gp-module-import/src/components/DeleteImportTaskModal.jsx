import React, { PropTypes } from 'react';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';

const DeleteImportTaskModal = props => (
  <Modal title="Удаление задачи импорта" {...props} isWidthAdaptive>
    <h4>{`Вы действительно хотите удалить задачу "${props.title}"?`}</h4>

    <div style={{ width: '100%', textAlign: 'center' }}>
      <AuiButton primary onClick={props.onSubmit}>Да</AuiButton>
      <AuiButton primary onClick={props.onClose}>Нет</AuiButton>
    </div>
  </Modal>
);

DeleteImportTaskModal.propTypes = {
  title: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DeleteImportTaskModal;
