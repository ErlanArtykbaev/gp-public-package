import React, { PropTypes, Component } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import Paginator from '@gostgroup/gp-ui-components/lib/Paginator';

import { connect } from 'react-redux';
import { getRfcOutcomeItem } from 'gp-core/lib/redux/modules/rfc/outbox';

import RfcItem from '../RfcItem';
import SubProcessItem from '../SubProcessItem';
import RfcActionNameComponent from '../RfcActionNameComponent';
import OutboxActionsComponent from './ActionsComponent';

export class RfcOutboxHandler extends Component {

  static propTypes = {
    rfc: PropTypes.shape({}),
    count: PropTypes.number,
    getItem: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.columnMetadata = [
      {
        columnName: 'entry',
        displayName: 'Действия',
        customComponent: OutboxActionsComponent,
      },
      {
        columnName: 'actionName',
        displayName: 'Действие',
        customComponent: RfcActionNameComponent,
      },
    ];

    this.columns = [
      'actionName',
      'entry',
    ];

    this.state = {
      page: 0,
    };
  }

  componentDidMount() {
    this.getItem(this.state.page);
  }

  onPageChange(page) {
    this.setState({ page });
    this.getItem(page);
  }

  onSubProcessPageChange(subProcessId, subProcessPage) {
    const { subProcessesPages } = this.state;
    subProcessesPages[subProcessId] = subProcessPage;
    this.setState({ subProcessesPages });
  }

  getSubProcessesDiv(subProcesses) {
    const divs = subProcesses.map((subProcess, index) =>
      <SubProcessItem subProcess={subProcess} key={index}>
        <SimpleGriddle
          results={subProcess.items.items}
          columnMetadata={this.columnMetadata}
          columns={this.columns}
        />
      </SubProcessItem>
    );
    return (
      <div>
        <h3>Список изменений, сгруппированный по процессам</h3>
        {divs}
      </div>
    );
  }

  getItem(page) {
    const { getItem } = this.props;
    getItem(page + 1);
  }

  render() {
    const { rfc, count } = this.props;
    const maxPage = count || 1;

    if (!rfc) return <div>Нет запросов</div>;

    return (
      <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
        <RfcItem rfc={rfc}>
          {this.getSubProcessesDiv(rfc.subProcesses)}
        </RfcItem>

        <Paginator currentPage={this.state.page} maxPage={maxPage} setPage={page => this.onPageChange(page)} />
      </div>
    );
  }
}

export default connect(
  state => state.core.rfc.outbox,
  { getItem: getRfcOutcomeItem },
)(RfcOutboxHandler);
