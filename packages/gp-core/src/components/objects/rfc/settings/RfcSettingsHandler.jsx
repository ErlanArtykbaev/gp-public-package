import React, { PropTypes, Component } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as rfcConfigActions from 'gp-core/lib/redux/modules/rfc/config';

// const ModelsActionComponent = ({ rowData }) => (
//   <p className="aui-buttons">
//     <AuiButton key={`view${rowData.id}`} onClick={() => window.open(`/activiti-explorer/modeler.html?modelId=${rowData.id}`, '_blank')}>Редактировать</AuiButton>
//   </p>
// );

const processesColumnsMeta = [
  {
    columnName: 'id',
    displayName: 'Идентификатор',
  },
  {
    columnName: 'key',
    displayName: 'Ключ',
  },
  {
    columnName: 'title',
    displayName: 'Наименование',
  },
];

const processesColumns = [
  'id',
  'title',
  'key',
];

const processModelColumnsMeta = [
  {
    columnName: 'id',
    displayName: 'Идентификатор',
  },
  {
    columnName: 'title',
    displayName: 'Наименование',
  },
  {
    columnName: 'createDate',
    displayName: 'Дата создания',
  },
  {
    columnName: 'lastUpdateDate',
    displayName: 'Дата последнего обновления',
  },
  // {
  //   columnName: 'actions',
  //   displayName: 'Действия',
  //   customComponent: ModelsActionComponent,
  // },
];

const processModelColumns = [
  'id',
  'title',
  'createDate',
  'lastUpdateDate',
  // 'actions',
];

@connect(
  state => state.core.rfc.config,
  dispatch => ({ actions: bindActionCreators(rfcConfigActions, dispatch) }),
)
export default class RfcSettingsHandler extends Component {

  static propTypes = {
    all_meta: PropTypes.shape({}),
    actions: PropTypes.shape({}),
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getProcessesMeta();
  }

  render() {
    const { all_meta = {} } = this.props;
    const { processes = [], process_models = [] } = all_meta;

    return (
      <div>
        <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
          <AuiButton onClick={() => window.open('/activiti-explorer/#process/', '_blank')}>Перейти к редактированию в Activiti Explorer</AuiButton>
          <h2>Модели процессов согласования</h2>
          <SimpleGriddle
            results={process_models}
            columnMetadata={processModelColumnsMeta}
            columns={processModelColumns}
          />
        </div>
        <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
          <h2>Процессы согласования</h2>
          <SimpleGriddle
            results={processes}
            columnMetadata={processesColumnsMeta}
            columns={processesColumns}
          />
        </div>
      </div>
    );
  }
}
