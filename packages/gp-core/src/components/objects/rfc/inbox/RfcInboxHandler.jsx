import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import Immutable from 'immutable';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import keys from 'lodash/keys';
import Paginator from '@gostgroup/gp-ui-components/lib/Paginator';
import { getProcessActionNameTypeWithObjectTitle } from '@gostgroup/gp-utils/lib/util.js';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as inboxActions from 'gp-core/lib/redux/modules/rfc/inbox';
import { getLoadingState } from 'gp-core/lib/redux/selectors/rfc/inbox';

import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import RfcItem from '../RfcItem';
import SubProcessItem from '../SubProcessItem';
import NewRecordModal from '../../element/NewRecordModal';
import CodingTable from '../CodingTable';
import ValidationResult from '../ValidationResult';
import RfcDuplicationDialog from './RfcDuplicationDialog';
import RemovedAndDuplicateItems from './RemovedAndDuplicateItems';
import SubProcessButtons from './SubProcessButtons';
import GreenDuplicationItems from './GreenDuplicationItems';

@connect(
  state => ({
    ...state.core.rfc.inbox,
    recordsByPath: state.core.record.recordsByPath,
    elementsByPath: state.core.element.elementsByPath,
    isLoading: getLoadingState(state, 'getItemFlow'),
  }),
  dispatch => ({
    getItem: bindActionCreators(inboxActions.getRfcIncomeItem, dispatch),
    actions: bindActionCreators(inboxActions, dispatch),
  }),
)
@autobind
export default class RfcInboxHandler extends Component {

  static propTypes = {
    recordsByPath: PropTypes.shape({}),
    elementsByPath: PropTypes.shape({}),
    count: PropTypes.number,
    rfc: PropTypes.shape({}),
    subProcessesItems: PropTypes.shape({}),
    getItem: PropTypes.func.isRequired,
    actions: PropTypes.shape({
      processRfcAction: PropTypes.func.isRequired,
      setRemoved: PropTypes.func.isRequired,
      setIncomePage: PropTypes.func.isRequired,
      getRfcIncomeItemSubProcessItems: PropTypes.func.isRequired,
      editProcessEntry: PropTypes.func.isRequired,
    }).isRequired,
    isLoading: PropTypes.bool,
    page: PropTypes.number,
  }

  constructor(props) {
    super(props);

    this.state = {
      rfcModalOpen: {},
      rfcDuplicationDialogOpen: false,
      meta: null,
      item: null,
      duplicationItems: null,
      subProcessesPages: {},
    };
  }

  componentDidMount() {
    this.props.actions.resetFetchState({});
    this.props.getItem();
  }

  getCodingTable(codingTables) {
    if (!codingTables || codingTables.length === 0) {
      return <h3>Перекодировочная таблица не сформирована</h3>;
    }
    return (
      <div>
        <h2>Перекодировочные таблицы</h2>
        <CodingTable codingTables={codingTables} hasRemoveButton />
      </div>
    );
  }

  getDublicationIdsWithDublicates(item, dublicatesInfo = []) {
    const dubUUIDS = (dublicatesInfo || [])
      .filter(dublicate => dublicate.uuid1 === item.uuid)
      .map(dub => dub.uuid2);
    return ([item.uuid, ...dubUUIDS]).join(', ');
  }

  processAction({ taskId, id, needsComment }) {
    const { actions, page } = this.props;
    if (needsComment) {
      global.textDialog({ message: 'Укажите причину' })
      .then(({ value }) => {
        actions.processRfcAction(taskId, id, page, value);
        this.props.getItem();
      })
      .catch(() => {});
    } else {
      global.confirmDialog({ body: 'Вы подтверждаете действие?' })
      .then(() => {
        actions.processRfcAction(taskId, id, page);
        this.props.getItem();
      })
      .catch(() => {});
    }
  }

  getDuplicationsButtons(item, meta, duplicationItems) {
    const { actions } = this.props;
    const readOnly = false;
    const cleanRFCModalOpen = {};
    return (
      <div>
        <p className="aui-buttons">
          <AuiButton onClick={() => this.rfcDuplicationDialogOpen(item, meta, duplicationItems)}>Дедупликация</AuiButton>
          <AuiButton onClick={() => this.openRfcModal(item)}>Редактировать</AuiButton>
          <AuiButton onClick={() => actions.setRemoved(item.uuid, item.subProcessId)}>Удалить из запроса</AuiButton>
        </p>
        <NewRecordModal
          isOpen={this.state.rfcModalOpen[item.uuid]}
          schema={item.entry.element.schema}
          data={item.entry.version.object}
          startDate={item.entry.version.dateStart}
          endDate={item.entry.version.dateEnd}
          readOnly={readOnly}
          onSubmit={this.editEntry}
          rfcProcessId={item.subProcessId}
          onClose={() => this.setState({ rfcModalOpen: cleanRFCModalOpen })}
        />
      </div>
    ); // TODO: добавить диалог редактирования версии
  }

  rfcDuplicationDialogOpen(item, meta, duplicationItems) {
    this.setState({ rfcDuplicationDialogOpen: true, item, meta, duplicationItems });
  }

  openRfcModal(item) {
    const rfcModalOpen = {};
    rfcModalOpen[item.uuid] = item;
    this.setState({ rfcModalOpen });
  }

  editEntry(data) {
    const uuid = keys(this.state.rfcModalOpen)[0];
    const item = this.state.rfcModalOpen[uuid];
    const { actions } = this.props;

    actions.editProcessEntry(item.subProcessId,
      item.entry.element.absolutPath, data, item.entry, uuid);

    this.setState({ rfcModalOpen: false });
  }

  getSubProcessItemsTable(subProcess, subProcessItems) {
    const containsDuplicates = subProcess.deduplicationInfo &&
      subProcess.deduplicationInfo.analyzedMeta &&
      subProcess.deduplicationInfo.analyzedMeta.length > 0;
    const { recordsByPath, elementsByPath } = this.props;

    if (!containsDuplicates) {
      return (
        <div>
          <GreenDuplicationItems
            title="Записи запроса"
            items={subProcessItems}
            diffAgainst={recordsByPath}
            currentElements={elementsByPath}
          />
          <Paginator
            maxPage={Math.ceil(subProcessItems.count / 15)}
            currentPage={this.state.subProcessesPages[subProcess.id] || 0}
            setPage={page => this.onSubProcessPageChange(subProcess.id, page)}
          />
          <RemovedAndDuplicateItems title="Удаленные записи" subProcess={subProcess} />
        </div>
      );
    }

    try {
      let notGreenItemsMap = new Immutable.Map();
      let notGreenItems = new Immutable.List();
      let duplicationsByUUID = new Immutable.Map();
      let analyzedMetaByUUID1 = new Immutable.Map();
      let analyzedMetaByUUID2 = new Immutable.Map();
      let greenItems = new Immutable.List();
      let dublicationUUIDs = new Immutable.List();
      // наполнение dublicationUUIDs и analyzedMetaByUUID
      subProcess.deduplicationInfo.analyzedMeta.forEach((analyzedMeta) => {
        dublicationUUIDs = dublicationUUIDs.push(analyzedMeta.uuid1).push(analyzedMeta.uuid2);
        analyzedMetaByUUID1 = analyzedMetaByUUID1.set(analyzedMeta.uuid1, analyzedMeta);
        analyzedMetaByUUID2 = analyzedMetaByUUID2.set(analyzedMeta.uuid2, analyzedMeta);
      });
      // наполнение списков greenItems и notGreenItems
      subProcessItems = subProcessItems.items ? subProcessItems.items : subProcessItems;
      subProcessItems.forEach((item) => {
        if (item.entry && dublicationUUIDs.indexOf(item.uuid) > -1) {
          notGreenItemsMap = notGreenItemsMap.set(item.uuid, item);
          notGreenItems = notGreenItems.push(item);
        } else {
          greenItems = greenItems.push(item);
        }
      });
      //
      dublicationUUIDs = dublicationUUIDs.toArray();
      analyzedMetaByUUID1 = analyzedMetaByUUID1.toObject();
      analyzedMetaByUUID2 = analyzedMetaByUUID2.toObject();
      notGreenItems = notGreenItems.toArray();
      notGreenItemsMap = notGreenItemsMap.toObject();
      greenItems = greenItems.toArray();
      // наполнение duplicationsByUUID
      notGreenItems.forEach((item) => {
        duplicationsByUUID = duplicationsByUUID.set(item.uuid, new Immutable.List());
        subProcess.deduplicationInfo.analyzedMeta
          .filter(analyzedMeta => analyzedMeta.uuid1 === item.uuid)
          .forEach((analyzedMeta) => {
            let duplicationItem = new Immutable.Map();
            if (notGreenItemsMap[analyzedMeta.uuid2]) {
              // ???
              if (notGreenItemsMap[analyzedMeta.uuid2] && notGreenItemsMap[analyzedMeta.uuid2].entry) {
                duplicationItem = duplicationItem
                  .set('entry', notGreenItemsMap[analyzedMeta.uuid2].entry)
                  .set('item1', item)
                  .set('item2', notGreenItemsMap[analyzedMeta.uuid2])
                  .set('rfcDraftProcessId', notGreenItemsMap[analyzedMeta.uuid2].rfcDraftProcessId)
                  .set('uuid', notGreenItemsMap[analyzedMeta.uuid2].uuid);
              }
            } else {
              // дубликат сохраненной записи
              duplicationItem = duplicationItem
                .set('entry', analyzedMeta.duplicationEntry)
                .set('item1', item);
              const item2 = new Immutable.Map()
                .set('entry', analyzedMeta.duplicationEntry)
                .set('savedEntry', true)
                .set('savedEntryId', duplicationItem.get('entry').id)
                .set('savedEntryVersionId', duplicationItem.get('entry').version.id);
              // duplicationItem.get('entry').id = null;
              // duplicationItem.get('entry').version.id = null;
              duplicationItem = duplicationItem
                .set('item2', item2.toObject())
                .set('rfcDraftProcessId', `Сохраненная запись (ID = ${item2.get('savedEntryId')})`)
                .set('uuid', `Сохраненная запись (ID = ${item2.get('savedEntryId')})`);
              // duplicationItem.uuid = analyzedMeta.duplicationEntry.id;
              // duplicationItem = duplicationItem.set('uuid', item.uuid);
            }
            duplicationItem = duplicationItem
              .set('status', analyzedMeta.status)
              .set('meta', `${analyzedMeta.meta} (c коэффициентом ${analyzedMeta.deduplicationResult})`);
            duplicationsByUUID = duplicationsByUUID
              .set(item.uuid, duplicationsByUUID.get(item.uuid).push(duplicationItem.toObject()));
          });
      });
      duplicationsByUUID = duplicationsByUUID.toObject();

      console.log(notGreenItems, analyzedMetaByUUID1);

      const getItemByUUID = item => get(analyzedMetaByUUID1, item.uuid, get(analyzedMetaByUUID2, item.uuid, {}));

      const duplicationRows = notGreenItems.map(item =>
        <tr key={item.uuid}>
          <td headers="id">{this.getDublicationIdsWithDublicates(item, subProcess.dublicates)}</td>
          <td headers="name">{item.entry.element.schema.title}</td>
          <td headers="actionName">{getProcessActionNameTypeWithObjectTitle(item)}</td>
          <td headers="status">
            <span
              className={`aui-lozenge aui-lozenge-${getItemByUUID(item).status === 'YELLOW' ? 'current' : 'error'}`}
            >
              {getItemByUUID(item).status === 'YELLOW' ? 'Желтый' : 'Красный'}
            </span>
          </td>
          <td headers="info">
            {`${getItemByUUID(item).meta} (c коэффициентом ${getItemByUUID(item).deduplicationResult})`}
          </td>
          <td headers="actions" style={{ width: '420px' }}>
            {this.getDuplicationsButtons(item, getItemByUUID(item), duplicationsByUUID[item.uuid].toArray())}
          </td>
        </tr>
      );
      const duplicationTable = (
        <table className="aui">
          <thead>
            <tr>
              <th id="id">ID изменения</th>
              <th id="name">Справочник</th>
              <th id="actionName">Действие</th>
              <th id="status">Статус дедубликации</th>
              <th id="info">Информация</th>
              <th id="actions">Действия</th>
            </tr>
          </thead>
          <tbody>
            {duplicationRows}
          </tbody>
        </table>
      );

      return (
        <div>
          <h2>Результат дедупликации</h2>
          {duplicationTable}
          <GreenDuplicationItems
            title="Прошедшие дедупликацию записи"
            items={greenItems}
            diffAgainst={this.props.recordsByPath}
            currentElements={this.props.elementsByPath}
          />
          <RemovedAndDuplicateItems
            title="Удаленные записи и дубли"
            subProcess={subProcess}
          />
          {this.getCodingTable(subProcess.codingTables)}
        </div>
      );
    } catch (e) {
      console.log(e);
      return (<div />);
    }
  }

  getSubProcessesDiv(subProcesses = []) {
    const divs = subProcesses.map((subProcess, i) =>
      <SubProcessItem subProcess={subProcess} key={i}>
        <ValidationResult
          subProcessId={subProcess.id}
          validateDataResult={subProcess.validateDataResult}
          customValidateResult={subProcess.customValidateResult}
        />
        {this.getSubProcessItemsTable(subProcess, this.props.subProcessesItems[subProcess.id])}
        <SubProcessButtons subProcess={subProcess} onAction={a => this.processAction(a)} />
      </SubProcessItem>
    );
    return (
      <div>
        <h3>Список изменений, сгруппированный по процессам</h3>
        {divs}
      </div>
    );
  }

  onPageChange(page) {
    const { actions } = this.props;
    actions.setIncomePage(page);
  }

  componentWillReceiveProps(props) {
    const newSubProcesses = get(props.rfc, 'subProcesses');
    const subProcesses = get(this.props.rfc, 'subProcesses');
    if (!isEqual(newSubProcesses, subProcesses)) {
      this.setState({ subProcessesPages: {} });
    }
  }

  onSubProcessPageChange(subProcessId, subProcessPage) {
    const { subProcessesPages } = this.state;
    subProcessesPages[subProcessId] = subProcessPage;
    this.setState({ subProcessesPages });
    this.getRfcIncomeItemSubProcessItems(subProcessId, subProcessPage);
  }

  getRfcIncomeItemSubProcessItems(subProcessId, page) {
    const { actions } = this.props;
    actions.getRfcIncomeItemSubProcessItems(subProcessId, page);
  }

  render() {
    const { rfc, count, isLoading, page } = this.props;
    const maxPage = count || 1;

    return (
      <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>

        {!!isLoading && <Preloader faded />}
        {!rfc
          ?
            'Нет запросов'
          :
            <RfcItem rfc={rfc}>
              {this.getSubProcessesDiv(rfc.subProcesses)}
            </RfcItem>
        }

        <Paginator currentPage={page} maxPage={maxPage} setPage={this.props.actions.setIncomePage} />

        <RfcDuplicationDialog
          isOpen={this.state.rfcDuplicationDialogOpen}
          meta={this.state.meta}
          item={this.state.item}
          duplicationItems={this.state.duplicationItems}
          onClose={() => this.setState({ rfcDuplicationDialogOpen: false })}
        />
      </div>
    );
  }
}
