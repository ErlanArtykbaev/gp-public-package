import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import omit from 'lodash/omit';
import { getProcessActionNameType, getProcessActionNameTypeWithObjectTitle } from '@gostgroup/gp-utils/lib/util.js';
import { DELETE_RESTORE_ROW_TYPES } from 'gp-core/lib/constants/rfc';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as inboxActions from 'gp-core/lib/redux/modules/rfc/inbox';

import NewElementModal from '../../NewElementModal';
import ViewGroupModal from '../../ViewGroupModal';
import NewGroupModal from '../../NewGroupModal';
import NewRecordModal from '../../element/NewRecordModal';

@connect(
  state => omit(state.core.rfc.inbox, ['rfc']),
  dispatch => ({ actions: bindActionCreators(inboxActions, dispatch) }),
)
@withModal
@autobind
export default class ActionsComponent extends Component {

  static propTypes = {
    rfc: PropTypes.shape({}),
    entry: PropTypes.shape({}),
    page: PropTypes.number,
    actions: PropTypes.shape({
      editProcessEntry: PropTypes.func.isRequired,
      editProcessElement: PropTypes.func.isRequired,
      editProcessGroup: PropTypes.func.isRequired,
    }).isRequired,
    modalIsOpen: PropTypes.bool,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
  }

  editEntry(data) {
    const { actions, rfc, page, closeModal } = this.props;
    actions.editProcessEntry(rfc.subProcessId,
      rfc.entry.element.absolutPath, data, rfc.entry, rfc.uuid, page);
    closeModal();
  }

  editElement(data) {
    const { actions, rfc, page, closeModal } = this.props;
    actions.editProcessElement(rfc.subProcessId,
      rfc.element.parent, data, rfc.uuid, page);
    closeModal();
  }

  editGroup(data) {
    const { actions, closeModal, rfc, page } = this.props;
    actions.editProcessGroup(rfc.subProcessId,
      rfc.tree.parent, data, rfc.uuid, page);
    closeModal();
  }

  render() {
    const { page, entry, actions, rfc,
      modalIsOpen, openModal, closeModal } = this.props;

    const removeButton = (
      <AuiButton key="remove-button" onClick={() => actions.setRemoved(rfc.uuid, rfc.subProcessId, page)}>
        Удалить из запроса
      </AuiButton>
    );

    if (DELETE_RESTORE_ROW_TYPES.indexOf(rfc.type) > -1) {
      return <p className="aui-buttons">{removeButton}</p>;
    }

    const openCloseProps = {
      isOpen: modalIsOpen,
      onClose: closeModal,
    };

    let buttons;

    if (rfc.uuid) { // признак возможности редактирования, см. BPMNEngine.fillProcessRFCItemInfoByHistory
      buttons = [
        <AuiButton key="button-1" onClick={openModal}>Редактировать</AuiButton>,
        removeButton,
      ];
    } else {
      buttons = <AuiButton key="button-1" onClick={openModal}>Просмотр</AuiButton>;
    }

    let dialog;
    const modalTitle = getProcessActionNameTypeWithObjectTitle(rfc);

    // console.log(rfc);
    if (rfc.uuid) {
      if (rfc.entry) {
        const rowEntryEditProps = {
          ...openCloseProps,
          element: rfc.entry,
          schema: rfc.entry.element.schema,
          data: rfc.entry.version.object,
          startDate: rfc.entry.version.dateStart,
          endDate: rfc.entry.version.dateEnd,
          readOnly: false,
          onSubmit: this.editEntry,
          rfcProcessId: rfc.subProcessId,
          record: rfc.entry,
        };
        dialog = (
          <NewRecordModal
            {...rowEntryEditProps}
          />
        );
      } else if (rfc.element || rfc.tree) {
        const objectEditProps = {
          ...openCloseProps,
          title: modalTitle,
        };
        if (rfc.element) {
          dialog = (
            <NewElementModal
              {...objectEditProps}
              onSubmit={this.editElement}
              element={rfc.element}
              schema={rfc.element.schema}
            />
          );
        } else if (rfc.tree) {
          dialog = (
            <NewGroupModal
              {...objectEditProps}
              data={rfc.tree}
              onSubmit={this.editGroup}
            />
          );
        }
      }
    } else if (rfc.entry) {
      dialog = (
        <NewRecordModal
          {...openCloseProps}
          element={entry}
          schema={entry.element.schema}
          data={entry.version.object}
          startDate={entry.version.dateStart}
          endDate={entry.version.dateEnd}
          readOnly
          title={modalTitle}
          record={entry}
          rfcProcessId={rfc.subProcessId}
        />
      );
    } else if (rfc.element) {
      dialog = (
        <NewElementModal
          {...openCloseProps}
          title={`${getProcessActionNameType(rfc.type)} "${rfc.element.schema.title}"`}
          readOnly
          schema={rfc.element.schema}
        />
      );
    } else if (rfc.tree) {
      dialog = (
        <ViewGroupModal
          {...openCloseProps}
          title={`${getProcessActionNameType(rfc.type)} "${rfc.tree.shortTitle}"`}
          data={rfc.tree}
        />
      );
    }

    return (
      <p className="aui-buttons">
        {buttons}
        {dialog}
      </p>
    );
  }
}
