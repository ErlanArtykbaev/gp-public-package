import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import { getProcessActionNameType } from '@gostgroup/gp-utils/lib/util.js';
import { DELETE_RESTORE_ROW_TYPES } from 'gp-core/lib/constants/rfc';
import withModal from '@gostgroup/gp-hocs/lib/withModal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as inboxActions from 'gp-core/lib/redux/modules/rfc/inbox';

import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import NewElementModal from '../../NewElementModal';
import NewRecordModal from '../../element/NewRecordModal';
import ViewGroupModal from '../../ViewGroupModal';

@connect(
  state => state.core.rfc.inbox,
  dispatch => ({ actions: bindActionCreators(inboxActions, dispatch) }),
)
@withModal
@autobind
export default class ActionsTrashComponent extends Component {

  static propTypes = {
    rowData: PropTypes.shape({}),
    data: PropTypes.shape({}),
    page: PropTypes.number,
    actions: PropTypes.shape({
      restoreRemoved: PropTypes.func.isRequired,
    }),
    modalIsOpen: PropTypes.bool,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
  }

  render() {
    const { modalIsOpen, openModal, closeModal } = this.props;
    const entry = this.props.data;
    const row = this.props.rowData;
    const { page, actions } = this.props;

    const restoreButton = (
      <AuiButton onClick={() => actions.restoreRemoved(row.uuid, row.subProcessId, page)}>
        Восстановить
      </AuiButton>
    );
    let viewDialog;

    if (DELETE_RESTORE_ROW_TYPES.indexOf(row.type) > -1) {
      return (
        <p className="aui-buttons">
          {restoreButton}
        </p>
      );
    }

    const openCloseProps = {
      isOpen: modalIsOpen,
      onClose: closeModal,
    };

    if (row.entry) {
      viewDialog = (
        <NewRecordModal
          {...openCloseProps}
          element={entry}
          schema={entry.element.schema}
          data={entry.version.object}
          startDate={entry.version.dateStart}
          endDate={entry.version.dateEnd}
          readOnly
          title={getProcessActionNameType(row.type)}
          record={entry}
          rfcProcessId={row.subProcessId}
        />
      );
    } else if (row.element) {
      viewDialog = (
        <NewElementModal
          {...openCloseProps}
          title={`${getProcessActionNameType(row.type)} "${row.element.schema.title}"`}
          readOnly
          onSubmit={this.editElement}
          element={row.element}
          schema={row.element.schema}
        />
      );
    } else if (row.tree) {
      viewDialog = (
        <ViewGroupModal
          {...openCloseProps}
          title={`${getProcessActionNameType(row.type)} "${row.tree.shortTitle}"`}
          data={row.tree}
        />
      );
    }

    return (
      <div>
        {viewDialog}
        <p className="aui-buttons">
          <AuiButton key={`view${row.id}`} onClick={openModal}>Просмотр</AuiButton>
          {restoreButton}
        </p>
      </div>
    );
  }

}
