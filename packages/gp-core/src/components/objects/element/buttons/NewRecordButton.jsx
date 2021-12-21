import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { bindActionCreators } from 'redux';
import * as elementActions from 'gp-core/lib/redux/modules/element';
import * as baseRecordDraftActions from 'gp-core/lib/redux/modules/recordDraft';
import { getLoadingState, elementSelector, currentElementSchemaSelector } from 'gp-core/lib/redux/selectors/element';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';
import BaseNewRecordModal from '../NewRecordModal';

const NewRecordModal = compose(
  connect(
    state => ({
      isLoading: getLoadingState(state, 'makeCreateRecord'),
      isOpen: state.core.element.modalsState.record,
      schema: currentElementSchemaSelector(state),
      element: elementSelector(state),
    }),
    dispatch => ({
      actions: bindActionCreators(elementActions, dispatch),
      recordDraftActions: bindActionCreators(baseRecordDraftActions, dispatch),
    }),
  ),
  withHandlers({
    onClose: ({ actions }) => () => actions.closeRecordModal(),
    onSubmit: ({ actions, element, recordDraftActions }) => (data, uuid) => {
      actions.createRecordAndRefresh(element.absolutPath, data)
        .then(() => {
          if (uuid) {
            recordDraftActions.flushDraft(uuid);
          }
        });
    },
  })
)(BaseNewRecordModal);

const SettingsButton = props => (
  <AuiButton {...props}>
    Новая запись
    <NewRecordModal />
  </AuiButton>
);

export default connect(
  null,
  { onClick: elementActions.openRecordModal }
)(SettingsButton);
