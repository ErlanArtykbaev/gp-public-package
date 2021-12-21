import React from 'react';
import ConfirmModal from './ConfirmModal';

export default function DeleteModal(props) {
  return <ConfirmModal alarm text="Вы действительно хотите удалить" {...props} />;
}
