import React, { PropTypes, Component } from 'react';
import { DELETE_RESTORE_ROW_TYPES } from 'gp-core/lib/constants/rfc';
import { getProcessActionNameType } from '@gostgroup/gp-utils/lib/util.js';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import RfcModalView from '../../RfcModalView';
import NewElementModal from '../../NewElementModal';
import ViewGroupModal from '../../ViewGroupModal';

export default class OutboxActionsComponent extends Component {

  static propTypes = {
    data: PropTypes.shape({}),
    rowData: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    this.editElementModalOpen = this.editElementModalOpen.bind(this);

    this.state = {
      rfcModalOpen: false,
    };
  }

  editElementModalOpen() {
    this.setState({ rfcModalOpen: true });
  }

  render() {
    const entry = this.props.data;
    const row = this.props.rowData;
    const readOnly = true;
    let button;

    if (DELETE_RESTORE_ROW_TYPES.indexOf(row.type) > -1) {
      return (
        <div />
      );
    }

    if (row.endDate && row.statusClass === 'success' && row.savedEntry) {
      const transition = () => (window.location.href = `/#/records/${row.savedEntry.absolutPath}?version=${row.savedEntry.version.id}`);
      button = <AuiButton onClick={transition}>Перейти к записи</AuiButton>;
    } else {
      button = <AuiButton onClick={() => this.editElementModalOpen()}>Просмотр</AuiButton>;
    }

    let viewDialog;
    if (row.entry) {
      viewDialog = (<RfcModalView
        isOpen={this.state.rfcModalOpen}
        schema={entry.element.schema}
        data={entry.version.object}
        startDate={entry.version.dateStart}
        endDate={entry.version.dateEnd}
        readOnly={readOnly}
        modalTitle={getProcessActionNameType(row.type)}
        entry={entry}
        rfcProcessId={row.subProcessId}
        onClose={() => this.setState({ rfcModalOpen: false })}
      />);
    } else if (row.element) {
      viewDialog = (
        <NewElementModal
          title={`${getProcessActionNameType(row.type)} "${row.element.schema.title}"`}
          isOpen={this.state.rfcModalOpen}
          onSubmit={this.editElement}
          onClose={() => this.setState({ rfcModalOpen: false })}
          element={row.element}
          schema={row.element.schema}
          readOnly
        />
      );
    } else if (row.tree) {
      viewDialog = (
        <ViewGroupModal
          title={`${getProcessActionNameType(row.type)} "${row.tree.shortTitle}"`}
          isOpen={this.state.rfcModalOpen}
          onClose={() => this.setState({ rfcModalOpen: false })}
          data={row.tree}
        />
      );
    }

    return (
      <div>
        <p className="aui-buttons">
          {button}
        </p>
        {viewDialog}
      </div>
    );
  }

}
