import React, { Component } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import CodingTableModal from './CodingTableModal';

class ViewTableComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      rfcModalOpen: false,
    };
  }

  render() {
    const row = this.props.rowData;

    return (
      <div>
        <p className="aui-buttons">
          <AuiButton onClick={() => this.setState({ rfcModalOpen: true })}>Просмотр</AuiButton>
        </p>
        <CodingTableModal
          isOpen={this.state.rfcModalOpen}
          onClose={() => this.setState({ rfcModalOpen: false })}
          elementName={row.elementName}
          extSystemId={row.extSystemId}
          absPath={row.absolutElementPath}
          items={row.items}
        />
      </div>
    );
  }
}

const columnMetadata = [
  {
    columnName: 'extSystemId',
    displayName: 'ID внешней системы',
  },
  {
    columnName: 'elementName',
    displayName: 'Справочник',
  },
  {
    columnName: 'viewTable',
    displayName: '',
    customComponent: ViewTableComponent,
  },
];

const column = [
  'extSystemId',
  'elementName',
  'viewTable',
];

export default class CodingTable extends Component {

  render() {
    const { codingTables = [] } = this.props;
    if (this.props.hasRemoveButton) {
      for (let i = 0; i < codingTables.length; i++) {
        const codingTable = codingTables[i];
        for (let j = 0; j < codingTable.items; j++) {
          const item = codingTable.item[j];
          item.hasRemoveButton = true;
        }
      }
    }
    return (
      <SimpleGriddle
        results={codingTables}
        columnMetadata={columnMetadata}
        columns={column}
        noDataMessage="Нет перекодировочных таблиц"
      />
    );
  }
}
