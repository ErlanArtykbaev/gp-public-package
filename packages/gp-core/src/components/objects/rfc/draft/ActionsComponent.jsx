import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { getProcessActionNameType } from '@gostgroup/gp-utils/lib/util.js';
import { DELETE_RESTORE_ROW_TYPES } from 'gp-core/lib/constants/rfc';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as draftActions from 'gp-core/lib/redux/modules/rfc/draft';

import NewRecordModal from '../../element/NewRecordModal';
import NewElementModal from '../../NewElementModal';
import NewGroupModal from '../../NewGroupModal';
import DeleteModal from '../DeleteModal';

@connect(
  null,
  dispatch => ({
    actions: bindActionCreators(draftActions, dispatch),
  }),
)
@autobind
export default class ActionsComponent extends Component {

  static propTypes = {
    actions: PropTypes.shape({
      editProcessDraftEntry: PropTypes.func.isRequired,
      editProcessDraftElement: PropTypes.func.isRequired,
      editProcessDraftGroup: PropTypes.func.isRequired,
      processDraftAction: PropTypes.func.isRequired,
    }),
  }

  constructor(props) {
    super(props);

    this.state = {
      deleteAllModalOpen: false,
      rfcModalOpen: false,
      curAction: null,
    };
  }

  openRfcModal() {
    this.setState({ rfcModalOpen: true });
  }

  async editEntry(data) {
    const { actions } = this.props;
    actions.editProcessDraftEntry(this.props.rowData.processId, this.props.rowData.entry.element.absolutPath, data, this.props.rowData.entry);
    this.setState({ rfcModalOpen: false });
  }

  async editElement(data) {
    const { actions } = this.props;
    actions.editProcessDraftElement(this.props.rowData.processId, this.props.rowData.element.parent, data);
    this.setState({ rfcModalOpen: false });
  }

  async editGroup(data) {
    const { actions } = this.props;
    actions.editProcessDraftGroup(this.props.rowData.processId, this.props.rowData.tree.parent, data);
    this.setState({ rfcModalOpen: false });
  }

  deleteAll(action) {
    this.setState({ deleteAllModalOpen: true, curAction: action });
  }

  onDeleteAll() {
    const { actions } = this.props;
    const curAction = this.state.curAction;

    actions.processDraftAction(curAction.taskId, curAction.id);

    this.setState({ deleteAllModalOpen: false, curAction: null });
  }

  render() {
    const row = this.props.rowData;
    const actions = this.props.data;

    const buttons = actions.map(action =>
      action.id === 'send' ? null :
      <AuiButton key={action.uuid} onClick={() => this.deleteAll(action)}>
        {action.name}
      </AuiButton>
    );
    const readOnly = false;

    const deleteModal = (
      <DeleteModal
        isOpen={this.state.deleteAllModalOpen}
        onClose={() => this.setState({ deleteAllModalOpen: false, curAction: null })}
        onSubmit={this.onDeleteAll}
        title="Удаление элементов"
        description="удалить выбранные элементы"
      />
    );

    if (DELETE_RESTORE_ROW_TYPES.indexOf(row.type) > -1) {
      return (
        <div className="aui-buttons">
          {buttons}
          {deleteModal}
        </div>
      );
    }
    let dialog;
    const openCloseProps = {
      isOpen: this.state.rfcModalOpen,
      onClose: () => this.setState({ rfcModalOpen: false }),
    };

    if (row.entry) {
      const entryProps = {
        ...openCloseProps,
        element: row.entry,
        schema: row.entry.element.schema,
        data: row.entry.version.object,
        startDate: row.entry.version.dateStart,
        endDate: row.entry.version.dateEnd,
        readOnly,
        onSubmit: this.editEntry,
        record: row.entry,
      };
      dialog = (
        <NewRecordModal
          {...entryProps}
        />
      );
    } else if (row.element) {
      dialog = (
        <NewElementModal
          {...openCloseProps}
          title={`${getProcessActionNameType(row.type)} "${row.element.schema.title}"`}
          onSubmit={this.editElement}
          element={row.element}
          schema={row.element.schema}
        />
      );
    } else if (row.tree) {
      dialog = (
        <NewGroupModal
          {...openCloseProps}
          title={`${getProcessActionNameType(row.type)} "${row.tree.shortTitle}"`}
          onSubmit={this.editGroup}
          data={row.tree}
        />
      );
    }
    return (
      <div className="aui-buttons">
        {buttons}
        <AuiButton onClick={this.openRfcModal}>Редактирование</AuiButton>
        {dialog}
        {deleteModal}
      </div>
    );
  }
}
