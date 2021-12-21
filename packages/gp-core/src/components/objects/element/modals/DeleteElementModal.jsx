import React from 'react';
import get from 'lodash/get';
import ConfirmModal from '@gostgroup/gp-ui-components/lib/modals/ConfirmModal';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { objectSelector } from 'gp-core/lib/redux/selectors/objects';
import { closeDeleteElementModal, deleteElementRFC, deleteElement } from 'gp-core/lib/redux/modules/element';
import { splatSelector } from 'gp-core/lib/redux/selectors/routing';

const DeleteElementModal = props => (
  <ConfirmModal
    title="Удаление справочника"
    name={get(props, 'schema.title')}
    {...props}
  />
);

const composition = compose(
  connect(
    state => ({
      // TODO сделать селекторы нормальные
      isOpen: state.core.element.modalsState.deleteRfc,
      schema: state.core.element.element.element.schema,
      splat: splatSelector(state),
      path: objectSelector(state),
    }),
    { delete: deleteElementRFC, hardDelete: deleteElement, onClose: closeDeleteElementModal },
    (stateProps, dispatchProps, ownProps) => {
      const { path } = stateProps;
      const element = path[path.length - 1];
      const hardDelete = element.permissions.includes('hard_admin');
      return {
        ...stateProps,
        ...ownProps,
        ...dispatchProps,
        onSubmit: hardDelete ? dispatchProps.hardDelete : dispatchProps.delete,
        text: hardDelete
          ? 'Вы обладаете правами суперпользователя. Справочник будет удален из системы без возможности востановления. Вы действительно хотите удалить справочник'
          : 'Вы действительно хотите удалить справочник',
      };
    }
  ),
  withHandlers({
    onSubmit: ({ splat, onSubmit }) => () => onSubmit(splat),
  }),
);

export default composition(DeleteElementModal);
