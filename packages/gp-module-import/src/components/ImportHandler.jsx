import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import uniqBy from 'lodash/uniqBy';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import Paginator from '@gostgroup/gp-ui-components/lib/Paginator';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import cx from 'classnames';
import Immutable from 'immutable';
import {
  KettleService,
} from '@gostgroup/gp-api-services/lib/services';
import { getImmutableRefs } from '@gostgroup/gp-core/lib/redux/selectors/objects';
import { RELATIONS_PATH_PREFIX } from '@gostgroup/gp-constructor/lib/components/relations-editor';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as importActions from '../redux/modules/import';

import NewImportTransformationModal from './NewImportTransformationModal';
import SettingsModal from './SettingsModal';
import LogTransformationModal from './LogTransformationModal';
import DeleteImportTaskModal from './DeleteImportTaskModal';
import LogComponent from './LogComponent';
import ActionComponent from './ActionComponent';
import ActionSettingsComponent from './ActionSettingsComponent';

// потому что гридл оборачивает запись в прототип
const makeSettingsObj = obj => ({
  externalSystemId: obj.externalSystemId,
  externalSystemName: obj.externalSystemName,
  elementKey: obj.elementKey,
  processId: obj.processId,
  users: obj.users,
});

@connect(
  state => ({
    ...state.core.import,
    immutableRefs: getImmutableRefs(state),
  }),
  dispatch => ({ actions: bindActionCreators(importActions, dispatch) })
)
@autobind
class ImportHandler extends Component {

  static propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({})),
    transformations: PropTypes.array,
    settings: PropTypes.array,
    externalSystems: PropTypes.array,
    processes_import: PropTypes.array,
    actions: PropTypes.shape({}),
    selectedTransformation: PropTypes.shape({}),
    immutableRefs: PropTypes.shape({}),
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      newImportTransformationModalOpen: false,
      newSettingsModalOpen: false,
      settingsData: {},
      logData: {},
      asEditor: false,
      logFilter: '',
      currentPage: 0,
      maxPage: 100,
      countFilter: 50,
      deleteImportTaskModalOpen: false,
      deleteImportTaskId: null,
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getProcessImportMap();
    actions.getExternalSystems();
    // actions.getObjectTree();
    actions.getImportTransformations();
    actions.getImportTasks();
  }

  async onLogFilterChange(e, ktrId) {
    const { actions } = this.props;
    const logFilter = ktrId || e.target.value;
    this.setState({ logFilter });
    this.setState({ loadingLogs: true });
    await actions.getImportTasks(logFilter, this.state.countFilter, this.state.currentPage);
    this.setState({ loadingLogs: false });
  }

  async onCountFilterChange(e) {
    const { actions } = this.props;
    this.setState({ countFilter: e.target.value });
    this.setState({ loadingLogs: true });
    await actions.getImportTasks(this.state.logFilter, e.target.value, this.state.currentPage);
    this.setState({ loadingLogs: false });
  }

  async onPageChange(e) {
    const { actions } = this.props;
    this.setState({ loadingLogs: true });
    await actions.getImportTasks(this.state.logFilter, this.state.countFilter, e);
    this.setState({ loadingLogs: false });
  }

  onRemoveClick(deleteImportTaskId, deleteImportTaskTitle) {
    this.setState({ deleteImportTaskId, deleteImportTaskTitle, deleteImportTaskModalOpen: true });
  }

  setTab(id) {
    const panes = document.getElementsByClassName('tabs-pane');
    const tabs = document.getElementsByClassName('menu-item');
    for (const tab of tabs) {
      tab.className = tab.className.replace('active-tab', '');
    }
    for (const pane of panes) {
      pane.className = pane.className.replace('active-pane', '');
    }
    const pane = document.getElementById(`tabs-pane-${id}`);
    tabs[id - 1].className += ' active-tab';
    pane.className += ' active-pane';
  }

  async editElement(id) {
    const { actions } = this.props;
    await actions.getImportTransformationById(id);
    this.setState({ asEditor: true, newImportTransformationModalOpen: true });
  }

  async runElement(id, name) {
    const responseCode = await KettleService.path('run_ktr', id).post().then(r => r.status);
    if (responseCode === 200) {
      global.NOTIFICATION_SYSTEM.notify('Информация', `Запуск трансформации ${name} прошел успешно.`, 'info');
    }
  }

  async removeElement() {
    const { actions } = this.props;

    await actions.removeImportTransformation(this.state.deleteImportTaskId);
    this.setState({ deleteImportTaskModalOpen: false });
  }

  showElementLog(id) {
    this.setTab(3);
    this.onLogFilterChange(null, id);
  }

  showRowLog(id, log) {
    const logData = {
      logText: log,
    };
    this.setState({ logData, logTransformationModalOpen: true });
  }

  async addNewTransformation(data) {
    const { actions } = this.props;
    actions.addNewImportTransformation(data).then(() => {
      this.setState({ asEditor: true });
    });
  }

  async refreshLogs() {
    const { actions } = this.props;
    this.setState({ loadingLogs: true });
    await actions.getImportTasks(this.state.logFilter, this.state.countFilter);
    this.setState({ loadingLogs: false });
  }

  async refreshSettings() {
    const { actions } = this.props;
    this.setState({ loadingLogs: true });
    await actions.getProcessImportMap();
    this.setState({ loadingLogs: false });
  }

  updateImportTransformation(data) {
    const { actions } = this.props;
    actions.updateImportTransformation(data);
    this.setState({ newImportTransformationModalOpen: false, asEditor: false });
  }

  // настройки импорта

  addNewSetting() {
    this.setState({ settingsData: null });
    this.openImportTransformation();
  }

  async editSettingsElement(obj) {
    const settingsData = makeSettingsObj(obj);

    this.setState({ settingsData });
    this.openImportTransformation();
  }

  async removeSettingsElement(data) {
    const { actions } = this.props;
    actions.removeProcessImportMapItem(makeSettingsObj(data));
  }

  openImportTransformation(asEditor) {
    const { actions } = this.props;
    actions.getProcessesImportList()
      .then(() => this.openImportTransformationCallback(asEditor));
  }

  openImportTransformationCallback(asEditor) {
    this.setState({
      asEditor,
      newSettingsModalOpen: true,
      processes: this.props.processes_import,
    });
  }

  render() {
    const { transformations = [], tasks = {}, selectedTransformation, immutableRefs } = this.props;
    let { settings = [] } = this.props;
    const refs = Immutable.fromJS(immutableRefs);
    const optionsDictionary = refs.toJS()
      .filter(({ id }) => (id.substr(0, RELATIONS_PATH_PREFIX.length) !== RELATIONS_PATH_PREFIX))
      .map(({ id, title }) => ({ value: id, label: title }));
    const externalSystems = this.props.externalSystems;

    if (optionsDictionary && optionsDictionary.length) {
      settings = settings.map((obj) => {
        const dictionary = optionsDictionary.find(item => (item.value === obj.elementKey));
        if (dictionary) obj.elementName = dictionary.label;

        if (externalSystems && externalSystems.length) {
          const externalSystem = externalSystems.find(item => (item.id === obj.externalSystemId));
          if (externalSystem) obj.externalSystemName = externalSystem.title;
        }
        return obj;
      });
    }

    const settingsColumns = ['elementName', 'externalSystemName', 'actions'];
    const settingsColumnsMetadata = [{
      columnName: 'actions',
      displayName: 'Действия',
      editElement: this.editSettingsElement,
      removeElement: this.removeSettingsElement,
      customComponent: ActionSettingsComponent,
    }, {
      columnName: 'externalSystemName',
      displayName: 'Внешняя система',
    }, {
      columnName: 'elementName',
      displayName: 'Справочник',
    }];

    const columns = ['name', 'formattedInterval', 'actions'];
    const columnsMetadata = [{
      columnName: 'actions',
      displayName: 'Действия',
      customComponent: ActionComponent,
      editElement: this.editElement,
      runElement: this.runElement,
      onRemoveClick: this.onRemoveClick,
      showElementLog: this.showElementLog,
    }, {
      columnName: 'formattedInterval',
      displayName: 'Интервал выполнения',
    }, {
      columnName: 'name',
      displayName: 'Название',
    }];

    const logColumns = ['executionstart', 'executionend', 'ktrName', 'status', 'log', 'executedManually'];
    const logColumnsMetadata = [{
      columnName: 'executionstart',
      displayName: 'Начало выполнения',
    }, {
      columnName: 'executionend',
      displayName: 'Конец выполнения',
    }, {
      columnName: 'ktrName',
      displayName: 'Задача импорта',
    }, {
      columnName: 'status',
      displayName: 'Статус',
    }, {
      columnName: 'log',
      displayName: 'Журнал ошибок',
      customComponent: LogComponent,
      showRowLog: this.showRowLog,
    }, {
      columnName: 'executedManually',
      displayName: 'Запуск вручную',
    }];

    const iconClassNames = cx('fa', 'fa-refresh', 'pointer', { 'fa-spin': this.state.loadingLogs });
    const tasksOptions = uniqBy(transformations, 'id').map(transformation => <option key={transformation.id} value={transformation.id}>{transformation.name}</option>);
    const countOptions = [10, 20, 40, 50, 60, 80, 100].map(value => <option key={value} value={value}>{value}</option>);


    return (
      <div style={{ margin: 50, marginTop: 0, paddingTop: 30, width: '80%' }}>

        <DeleteImportTaskModal
          isOpen={this.state.deleteImportTaskModalOpen}
          onSubmit={this.removeElement}
          title={this.state.deleteImportTaskTitle}
          onClose={() => this.setState({ deleteImportTaskModalOpen: false })}
        />

        <div className="aui-tabs vertical-tabs">
          <ul className="tabs-menu">
            <li className="menu-item">
              <a onClick={() => this.setTab(1)}>Настройка импорта</a>
            </li>
            <li className="menu-item active-tab">
              <a onClick={() => this.setTab(2)}>Задачи импорта</a>
            </li>
            <li className="menu-item">
              <a onClick={() => this.setTab(3)}>Журнал выполнения</a>
            </li>
          </ul>
          <div className="tabs-pane" id="tabs-pane-1">
            <h2>Настройка импорта</h2>
            <div>
              <AuiButton type="button" onClick={() => this.addNewSetting()}>Добавить</AuiButton>
            </div>

            <SettingsModal
              isOpen={this.state.newSettingsModalOpen}
              data={this.state.settingsData}
              onUpdate={this.updateImportTransformation}
              externalSystems={externalSystems}
              onSubmit={(data) => {
                this.addNewTransformation(data);
                this.refreshSettings();
              }}
              onClose={() => {
                this.setState({ newSettingsModalOpen: false, errors: [] });
                this.refreshSettings();
              }}
              processes={this.state.processes}
            />

            <SimpleGriddle
              results={settings}
              columns={settingsColumns}
              columnMetadata={settingsColumnsMetadata}
              initialSort={'id'}
            />
          </div>

          <div className="tabs-pane active-pane" id="tabs-pane-2">
            <h2>Задачи импорта</h2>
            <div>
              <AuiButton type="button" onClick={() => this.setState({ asEditor: false, newImportTransformationModalOpen: true })}>Добавить</AuiButton>
            </div>

            <NewImportTransformationModal
              isOpen={this.state.newImportTransformationModalOpen}
              data={selectedTransformation}
              asEditor={this.state.asEditor}
              onUpdate={this.updateImportTransformation}
              onSubmit={this.addNewTransformation}
              onClose={() => { this.setState({ newImportTransformationModalOpen: false, errors: [] }); }}
            />
            <SimpleGriddle
              results={transformations}
              columns={columns}
              columnMetadata={columnsMetadata}
              initialSort={'id'}
            />
          </div>
          <div className="tabs-pane" id="tabs-pane-3">
            <h2>Журнал выполнения <i className={iconClassNames} onClick={this.refreshLogs} /></h2>
            <div className="inline-block">
              Задача импорта
              <select className="form-control w-200" value={this.state.logFilter} onChange={this.onLogFilterChange}>
                <option value={''}>Все</option>
                {tasksOptions}
              </select>
            </div>
            <div className="inline-block m-l-40">
              Количество записей на странице
              <select className="form-control w-200" value={this.state.countFilter} onChange={this.onCountFilterChange}>
                {countOptions}
              </select>
            </div>
            <SimpleGriddle
              results={tasks}
              resultsPerPage={this.state.countFilter}
              showPager={false}
              columns={logColumns}
              initialSort={'executionend'}
              initialSortAscending={false}
              columnMetadata={logColumnsMetadata}
            />
            <Paginator currentPage={tasks.page} maxPage={tasks.numberOfPages} setPage={this.onPageChange} />
            <LogTransformationModal
              isOpen={this.state.logTransformationModalOpen}
              data={this.state.logData}
              onClose={() => { this.setState({ logTransformationModalOpen: false }); }}
            />
          </div>
        </div>
      </div>
    );
  }

}

export default ImportHandler;
