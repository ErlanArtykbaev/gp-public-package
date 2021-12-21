import React from 'react';
import get from 'lodash/get';
import ConfirmModal from '@gostgroup/gp-ui-components/lib/modals/ConfirmModal';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { closeRestoreElementModal, restoreElementRFC } from 'gp-core/lib/redux/modules/element';
import { splatSelector } from 'gp-core/lib/redux/selectors/routing';

const RestoreElementModal = props => (
  <ConfirmModal
    text="Вы действительно хотите восстановить справочник"
    title="Восстановление справочника"
    name={get(props, 'schema.title')}
    {...props}
  />
);

const composition = compose(
  connect(
    state => ({
      isOpen: state.core.objects.modalsState.restoreRfc,
      schema: state.core.element.element.schema,
      splat: splatSelector(state),
    }),
    { onSubmit: restoreElementRFC, onClose: closeRestoreElementModal }
  ),
  withHandlers({
    onSubmit: ({ splat, onSubmit }) => () => onSubmit(splat),
  }),
);

export default composition(RestoreElementModal);
