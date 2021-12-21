import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import StatusComponent from '@gostgroup/gp-ui-components/lib/StatusComponent';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as draftActions from 'gp-core/lib/redux/modules/rfc/draft';
import * as baseObjectsActions from 'gp-core/lib/redux/modules/objects';

import RfcActionNameComponent from '../RfcActionNameComponent';
import InputCommentModal from '../InputCommentModal';
import ValidationResult from '../ValidationResult';
import DeleteModal from '../DeleteModal';
import ActionsComponent from './ActionsComponent';

const CheckBoxComponent = ({ data, rowData, metadata }) =>
  <input type="checkbox" className="checkbox" defaultChecked={rowData.checked} onClick={() => metadata.onClick(data)} />
;

CheckBoxComponent.propTypes = {
  data: PropTypes.string,
  rowData: PropTypes.shape({}),
  metadata: PropTypes.shape({}),
};

@connect(
  state => state.core.rfc.draft,
  dispatch => ({
    actions: bindActionCreators(draftActions, dispatch),
    objectsActions: bindActionCreators(baseObjectsActions, dispatch),
  }),
)
@autobind
export default class RfcDraftHandler extends Component {

  static propTypes = {
    drafts: PropTypes.array,
    errors: PropTypes.object,
    actions: PropTypes.shape({
    }).isRequired,
    objectsActions: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    this.state = {
      rfcCommentOpen: false,
      ids: [],
      deleteAllModalOpen: false,
      data: props.drafts,
    };

    this.columnMetadata = [
      {
        columnName: 'processId',
        displayName: '',
        customComponent: CheckBoxComponent,
        onClick: this.onSelect,
      },
      {
        columnName: 'name',
        displayName: 'Текущая задача',
      },
      {
        columnName: 'processName',
        displayName: 'Имя процесса',
      },
      {
        columnName: 'actions',
        displayName: 'Операции',
        customComponent: ActionsComponent,
      },
      {
        columnName: 'status',
        displayName: 'Статус',
        customComponent: StatusComponent,
      },
      {
        columnName: 'assignDate',
        displayName: 'Дата создания',
      },
      {
        columnName: 'actionName',
        displayName: 'Действие',
        customComponent: RfcActionNameComponent,
      },
    ];

    this.columns = [
      // 'id',
      'processId',
      // 'processName',
      // 'name',
      'actionName',
      'assignDate',
      'status',
      'actions',
    ];
  }

  componentDidMount() {
    const { actions, objectsActions } = this.props;
    objectsActions.getObjectTree();
    actions.getRfcDraft();
  }

  componentWillReceiveProps(props) {
    this.setState({ data: props.drafts });
  }

  onSelect(processId) {
    const { data } = this.state;
    data.map((d) => {
      if (d.processId === processId) {
        d.checked = !d.checked;
      }
      return d;
    });
    this.setState({ data });
  }

  selectAll() {
    const { data } = this.state;
    data.forEach(d => (d.checked = true));
    this.setState({ data });
  }

  unSelectAll() {
    const { data } = this.state;
    data.map(d => (d.checked = false));
    this.setState({ data });
  }

  onSubmit() {
    const { data } = this.state;
    const ids = data.filter(d => d.checked).map(d => d.processId);
    if (ids.length === 0) {
      global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Для отправки запроса выберите изменения из таблицы.', 'error');
    } else {
      this.setState({ rfcCommentOpen: true, ids });
    }
  }

  submitComment(data) {
    const { actions } = this.props;
    actions.sendRfcRequest({ comment: data, ids: this.state.ids });
    this.setState({ rfcCommentOpen: false });
  }

  deleteAll() {
    const { data } = this.state;
    const ids = data.filter(d => d.checked).map(d => d.id);

    if (ids.length === 0) {
      global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Для удаления изменений выберите изменения из таблицы.', 'error');
    } else {
      this.setState({ deleteAllModalOpen: true });
    }
  }

  async onDeleteAll() {
    const { data } = this.state;
    const { actions } = this.props;
    const ids = data.filter(d => d.checked).map(d => d.id);

    if (ids.length === 0) {
      global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Для удаления изменений выберите изменения из таблицы.', 'error');
    } else {
      actions.sendRfcDelete({ ids });
    }

    this.setState({ deleteAllModalOpen: false });
  }

  render() {
    const { data } = this.state;
    const { errors } = this.props;
    const { columns, columnMetadata } = this;

    let submitErrorsDiv;

    const hasErrors = (errors.validateDataResult && Object.keys(errors.validateDataResult).length > 0)
      || (errors.customValidateResult && Object.keys(errors.customValidateResult).length > 0);
    if (hasErrors) {
      submitErrorsDiv = (<div className="aui-message aui-message-error">
        <div className="title">
          <h2>Ошибка отправки пакета!</h2>
          <ValidationResult
            validateDataResult={errors.validateDataResult}
            customValidateResult={errors.customValidateResult}
          />
        </div>
      </div>);
    }

    return (
      <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
        {submitErrorsDiv}

        {!!(data && data.length) &&
          <div style={{ marginBottom: 10, marginTop: 20 }}>
            <AuiButton onClick={this.selectAll}>Выбрать все</AuiButton>
            <AuiButton onClick={this.unSelectAll}>Снять выбор</AuiButton>
          </div>
        }

        <SimpleGriddle
          results={data}
          columnMetadata={columnMetadata}
          columns={columns}
          noDataMessage="Нет запросов на изменения"
        />
        {data && data.length
          ?
            <div style={{ paddingLeft: 145 }}>
              <AuiButton onClick={this.onSubmit}>
                Отправить выбранное
              </AuiButton>
              <AuiButton primary onClick={this.deleteAll}>
                Удалить выбранное
              </AuiButton>
            </div>
        : ''}
        <DeleteModal
          isOpen={this.state.deleteAllModalOpen}
          onClose={() => this.setState({ deleteAllModalOpen: false })}
          onSubmit={this.onDeleteAll}
          title="Удаление элементов"
          description="удалить выбранные элементы"
        />
        <InputCommentModal
          isOpen={this.state.rfcCommentOpen}
          onClose={() => this.setState({ rfcCommentOpen: false })}
          modalTitle="Создание запроса изменений"
          saveButtonName="Оправить заявку"
          textAreaTitle="Наименование запроса"
          onSubmit={this.submitComment}
        />
      </div>
    );
  }

}
