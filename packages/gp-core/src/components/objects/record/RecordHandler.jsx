import React, { PropTypes, Component } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import { autobind } from 'core-decorators';
import 'moment-range';
import { withRouter } from 'react-router';
import { computableField, formatDate } from '@gostgroup/gp-utils/lib/util.js';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';

import { connect } from 'react-redux';
import * as recordActions from 'gp-core/lib/redux/modules/record';
import { objectSelector } from 'gp-core/lib/redux/selectors/objects';
import { getLoadingState } from 'gp-core/lib/redux/selectors/record';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';
import { bindActionCreators } from 'redux';

import ConfirmModal from '@gostgroup/gp-ui-components/lib/modals/ConfirmModal';
import { Form } from '@gostgroup/gp-forms';
import DatePicker from '@gostgroup/gp-ui-components/lib/DatePicker';
import Breadcrumbs from '../common/Breadcrumbs';
import BaseNewRecordModal from '../element/NewRecordModal';
import ReferenceLink from '../ReferenceLink';
import HistoryLinkComponent from '../HistoryLinkComponent';
import History from './History';
import VersionsList from './VersionsList';
import VersionsTimeline from './VersionsTimeline';
import Relations from './Relations';

const NewRecordModal = connect(
  state => ({
    isLoading: getLoadingState(state, 'updateVersion'),
  })
)(BaseNewRecordModal);

@connect(
  state => ({
    ...state.core.record,
    path: objectSelector(state),
  }),
  dispatch => ({ actions: bindActionCreators(recordActions, dispatch) }),
)
@withRouter
@autobind
class RecordHandler extends Component {

  static propTypes = {
    path: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    record: PropTypes.shape({}).isRequired,
    versionId: PropTypes.number,
    version: PropTypes.shape({}),
    versions: PropTypes.arrayOf(PropTypes.shape({})),
    date: PropTypes.shape({}),
    actions: PropTypes.shape({}),
    modalsState: PropTypes.shape({}),
  }

  constructor(props, context) {
    super(props, context);

    const { date } = props;

    this.state = {
      date,
      deleteRecordModalOpen: false,
    };
  }

  onDateChange(date) {
    const { router, location } = this.props;
    date = moment(date);
    router.push({
      pathname: location.pathname,
      query: {
        date: createValidDate(date),
      },
    });
  }

  addNewVersion(data) {
    const { record, actions } = this.props;

    actions.addNewVersion(record.absolutPath, data);
  }

  updateVersion(data) {
    const { record, actions } = this.props;

    actions.updateVersion(record.absolutPath, data);
  }

  deleteRecord() {
    const { actions, record } = this.props;

    actions.deleteEntryRFC(record.absolutPath);
  }

  restoreRecord() {
    const { actions, record } = this.props;

    actions.restoreEntryRFC(record.absolutPath);
  }

  render() {
    const { params, path, actions, modalsState } = this.props;
    const { isFetching, record, version, versionId, versions } = this.props;

    if (isFetching || !record) {
      return <Preloader />;
    }

    const { splat } = params;
    const disabled = !!(typeof record.isAvailable !== 'undefined' && record.isAvailable === false);

    const schema = record.element.schema;
    const current = path[path.length - 1];
    const permission = current.permissions || [];

    let processInfoLink;
    if (record.processId) {
      const name = 'Посмотреть заявку на изменение';
      const rowData = {
        processId: record.processId,
      };
      processInfoLink = <HistoryLinkComponent key="processInfo" data={name} rowData={rowData} />;
    } else {
      processInfoLink = <p key="processInfo" />;
    }

    const fullTitleText = computableField(record.fullTitle, version.object);
    const fullTitle = disabled ? <h1 style={{ color: '#999' }}>{`${fullTitleText} (Не доступен)`}</h1> : <h1>{fullTitleText}</h1>;
    const title = computableField(record.title, version.object);

    const toolbar = (
      <div className="float-right">
        <div className="aui-buttons">
          {disabled && <button
            className="sh-btn btn" disabled={!permission.includes('delete_entry')}
            onClick={actions.openRestoreVersionModal}
          >
            Восстановить запись
          </button>}
          <button
            className="sh-btn btn" disabled={!permission.includes('create_version') || disabled}
            onClick={actions.openNewVersionModal}
          >
            Добавить версию
          </button>
          <button
            className="sh-btn btn" disabled={!permission.includes('edit_version') || disabled}
            onClick={actions.openUpdateVersionModal}
          >
            Изменить версию
          </button>
          {!disabled && <button
            className="sh-btn btn" disabled={!permission.includes('delete_entry') || disabled}
            onClick={actions.openDeleteVersionModal}
          >
            Удалить запись
          </button>}
        </div>
      </div>
    );

    return (
      <div key={record.absolutPath}>
        <Breadcrumbs
          path={path.concat([{
            type: 'record',
            absolutPath: record.absolutPath,
            shortTitle: title,
          }])}
        />

        {fullTitle}

        {toolbar}

        <NewRecordModal
          schema={schema}
          element={record}
          data={cloneDeep(version.object)}
          versions={versions}
          record={record}
          isOpen={modalsState.newVersion}
          onClose={actions.closeNewVersionModal}
          onSubmit={this.addNewVersion}
        />

        <NewRecordModal
          startDate={version.dateStart}
          endDate={version.dateEnd}
          element={record}
          record={record}
          schema={schema}
          version={version}
          // versions={versions.filter(v => v.id !== version.id)}
          data={cloneDeep(version.object)}
          isOpen={modalsState.update}
          onClose={actions.closeUpdateVersionModal}
          onSubmit={this.updateVersion}
        />

        <ConfirmModal
          title="Удаление записи"
          isOpen={modalsState.delete}
          onSubmit={this.deleteRecord}
          text="Вы действительно хотите удалить запись"
          onClose={actions.closeDeleteVersionModal}
          name={version.object.title}
        />

        <ConfirmModal
          title="Восстановление записи"
          isOpen={modalsState.restore}
          onSubmit={this.restoreRecord}
          text="Вы действительно хотите восстановить запись"
          onClose={actions.closeRestoreVersionModal}
          name={version.object.title}
        />

        <form className="aui top-label" style={{ marginTop: 60 }}>
          <div className="field-group top-label element-date-picker">
            <DatePicker label="Дата:" onChange={this.onDateChange} value={formatDate(this.props.date)} />
          </div>
        </form>

        <div className="aui-group">
          {versionId &&
            <div className="aui-item">
              <h3>Версия</h3>

              <form className="aui top-label">
                <div className="field-group top-label">
                  <label>Начало действия:</label>
                  <span>{formatDate(version.dateStart) || 'Не указано'}</span>
                </div>
                <div className="field-group top-label">
                  <label>Окончание действия:</label>
                  <span>{formatDate(version.dateEnd) || 'Не указано'}</span>
                </div>
              </form>

              <Form
                config={schema}
                data={version.object}
                ReferenceLink={ReferenceLink}
                filterDate={createValidDate(this.state.date)}
                element={record}
                basicData={record}
              />
            </div>
          }
          <div className="aui-item">
            <VersionsList splat={splat} versions={versions} versionId={versionId} />
            {/* <VersionsTimeline versions={versions} />*/}
          </div>
        </div>
        {processInfoLink}
        <Relations record={record} version={version} />
        <History record={record} versionId={versionId} versions={versions} splat={splat} />
      </div>
    );
  }

}

export default RecordHandler;
