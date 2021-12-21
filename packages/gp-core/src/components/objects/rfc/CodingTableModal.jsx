import React, { Component } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import { getCodingTablesItems } from 'gp-core/lib/redux/modules/rfc/codingTables';

class RemoveActionComponent extends Component {

  render() {
    const row = this.props.rowData;

    if (row.hasRemoveButton) {
      return (
        <div>
          <p className="aui-buttons">
            <AuiButton onClick={() => this.removeTableItem()}>Удалить</AuiButton>
          </p>
        </div>
      );
    }
    return (
      <div />
    );
  }
}


const columnMetadata = [
  {
    columnName: 'existEntryId',
    displayName: 'ID существующей записи',
  },
  {
    columnName: 'extSystemEntryId',
    displayName: 'ID внешней системы',
  },
  {
    columnName: 'actions',
    displayName: '',
    customComponent: RemoveActionComponent,
  },
];

const column = [
  'existEntryId',
  'extSystemEntryId',
  'actions',
];

export default class CodingTableModal extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
    };
  }
  async componentWillMount() {
    const { extSystemId, absPath } = this.props;
    const load = await getCodingTablesItems({ extSysId: extSystemId, absPath });
    const payload = await load.payload;
    this.setState({
      items: payload.items,
    });

  }
  render() {
    return (
      <Modal
        title={`Перекодировочная таблица справочника '${this.props.elementName}' из системы ${this.props.extSystemId}`}
        {...this.props}
      >
        <SimpleGriddle
          results={this.state.items}
          columnMetadata={columnMetadata}
          columns={column}
        />
      </Modal>
    );
  }
}
