import React from 'react';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';
import { openMoveElementModal } from 'gp-core/lib/redux/modules/element';
import { connect } from 'react-redux';
import MoveElementModal from '../modals/MoveElementModal';

const MoveElementButton = props => (
  <AuiButton
    {...props}
  >
    Переместить
    <MoveElementModal />
  </AuiButton>
);

export default connect(
  null,
  { onClick: openMoveElementModal }
)(MoveElementButton);
