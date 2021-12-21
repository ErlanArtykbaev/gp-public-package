import React, { PropTypes } from 'react';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';

export default function LogTransformationModal(props) {
  return (
    <Modal title="Журнал ошибок" {...props}>
      <p>{props.data.logText}</p>
    </Modal>
  );
}

LogTransformationModal.propTypes = {
  data: PropTypes.shape({
    logText: PropTypes.string,
  }),
};
