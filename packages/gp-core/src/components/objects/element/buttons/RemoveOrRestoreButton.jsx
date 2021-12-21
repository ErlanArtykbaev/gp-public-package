import React, { PropTypes } from 'react';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';
import { openRestoreElementModal, openDeleteElementModal } from 'gp-core/lib/redux/modules/element';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { elementSelector } from 'gp-core/lib/redux/selectors/element';
import DeleteElementModal from '../modals/DeleteElementModal';
import RestoreElementModal from '../modals/RestoreElementModal';

const RemoveOrRestoreButton = props => (
  <AuiButton {...props}>
    {props.title}
    {props.children}
    <DeleteElementModal />
    <RestoreElementModal />
  </AuiButton>
);

RemoveOrRestoreButton.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};

const composition = compose(
  connect(
    (state) => {
      const element = elementSelector(state);
      const removed = element.status === 'not_available';

      return {
        title: removed ? 'Восстановить' : 'Удалить',
        removed,
      };
    },
    { openDeleteElementModal, openRestoreElementModal },
    (stateProps, dispatchProps, ownProps) => ({
      ...stateProps,
      onClick: stateProps.removed ? dispatchProps.openRestoreElementModal : dispatchProps.openDeleteElementModal,
      ...ownProps,
    })
  )
);

export default composition(RemoveOrRestoreButton);
