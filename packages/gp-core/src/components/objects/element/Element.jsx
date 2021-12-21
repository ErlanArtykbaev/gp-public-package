import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { formatDate } from '@gostgroup/gp-utils/lib/util.js';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';
import getTreeData from '@gostgroup/gp-nsi-utils/lib/element/getTreeData';
import Paginator from '@gostgroup/gp-ui-components/lib/Paginator';
import DISPLAY_MODE from 'gp-core/lib/constants/element/displayMode';
import convertPropertyFilters from '@gostgroup/gp-nsi-utils/lib/element/convertPropertyFilters';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import Checkbox from '@gostgroup/gp-ui-components/lib/Checkbox';

import { connect } from 'react-redux';
import { getLoadingState } from 'gp-core/lib/redux/selectors/element';
import { elementHasDraftsSelector } from 'gp-core/lib/redux/selectors/recordDraft';
import { startRecordCreation, flushDraft, saveDraftsInElement } from 'gp-core/lib/redux/modules/recordDraft';

import configurableDetails, { DetailsToggle } from 'gp-core/lib/components/objects/common/configurableDetails';
import DatePicker from '@gostgroup/gp-ui-components/lib/DatePicker';
import DisplayModeSwitcher from './DisplayModeSwitcher';
import ItemData from 'gp-core/lib/components/objects/ItemData';
import RecordTable from 'gp-core/lib/components/objects/recordTable';
import BaseNewElementModal from 'gp-core/lib/components/objects/NewElementModal';
import PropertyFilter from '@gostgroup/gp-ui-components/lib/PropertyFilter';
import ImportDropdown from 'gp-core/lib/components/objects/element/import/ImportDropdown';
import ExportDropdown from 'gp-core/lib/components/objects/element/ExportDropdown';

import NewRecordButton from 'gp-core/lib/components/objects/element/buttons/NewRecordButton';
import MoveElementButton from 'gp-core/lib/components/objects/element/buttons/MoveElementButton';
import SettingsButton from 'gp-core/lib/components/objects/element/buttons/SettingsButton';
import CheckDeduplicationButton from 'gp-core/lib/components/objects/element/buttons/CheckDeduplicationButton';
import DeduplicationLinkButton from 'gp-core/lib/components/objects/element/buttons/DeduplicationLinkButton';
import RemoveOrRestoreButton from 'gp-core/lib/components/objects/element/buttons/RemoveOrRestoreButton';

import initPropertyFilters from 'gp-core/lib/components/objects/element/initPropertyFilters';
import styles from 'gp-core/lib/components/objects/element/Element.scss';

const mapModalStateToProps = state => ({
  isLoading: getLoadingState(state, 'makeUpdateElement'),
});

const NewElementModal = connect(mapModalStateToProps)(BaseNewElementModal);

// TODO можно сделать обвес модальных окон коннектами в отдельном файле и
// сократить количество кода в render и в самих модалках (5)
@configurableDetails('toggle')
@connect(
  (state, props) => ({
    hasStagedChanges: elementHasDraftsSelector(state)(props.element.element.absolutPath),
  }),
  { startRecordCreation, flushDraft, saveDraftsInElement }
)
@autobind
export default class Element extends Component {

  static propTypes = {
    actions: PropTypes.shape({
      changePage: PropTypes.func,
      getDuplicationResultLink: PropTypes.func,
      toggleShowNotAvailable: PropTypes.func,
    }),
    path: PropTypes.arrayOf(PropTypes.shape({})),
    page: PropTypes.number,
    element: PropTypes.object,
    pageSetting: PropTypes.shape({}),
    splat: PropTypes.string,
    reference_data: PropTypes.shape({}),
    modalsState: PropTypes.shape({}),
    displayMode: PropTypes.string,
    hasStagedChanges: PropTypes.bool,
    isSaving: PropTypes.bool,
    itemDataIsVisible: PropTypes.bool,
    startRecordCreation: PropTypes.func,
    saveDraftsInElement: PropTypes.func,
    EditModal: PropTypes.func,
    showNotAvailable: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      propertyFilters: [],
      // sorting
      sortColumn: 'entry_id',
      sortType: 'asc',
    };
  }

  componentWillMount() {
    this.init(this.props);
    this.props.actions.getDuplicationResultLink(this.props.splat);
  }

  componentWillReceiveProps(props) {
    this.init(props);
  }

  handleParentChange(currentParent) {
    this.setState({ currentParent });
  }

  editElement(data) {
    const { path, actions } = this.props;
    const current = path[path.length - 2];

    actions.updateElement(current, data.schema, data.main_data);
  }

  onPropertyFiltersChange(propertyFilters) {
    // буэ
    const removed = propertyFilters.length < this.state.propertyFilters.length;
    this.setState({ propertyFilters }, () => removed ? this.setPropertyFilters(propertyFilters) : null);
  }

  setPropertyFilters(propertyFilters = this.state.propertyFilters) {
    const { actions, splat } = this.props;

    actions.setElementMeta(
      propertyFilters.filter(PropertyFilter.isValid),
      splat,
      'propertyFilters'
    );
    actions.changePage(0);
  }

  init(props) {
    const { element, pageSetting } = props;
    const propertyFilters = initPropertyFilters(pageSetting.propertyFilters, element.element.schema);
    this.setState({ propertyFilters });
  }

  onSortChange(field, asc) {
    this.setState({
      sortColumn: field,
      sortType: asc ? 'asc' : 'desc',
    }, () => this.props.actions.changePage(0));
  }

  render() {
    const { element, path } = this.props;
    const { modalsState, actions, pageSetting, displayMode, splat, page, reference_data } = this.props;
    const { columns, conditionFilters, itemsForPage } = pageSetting;
    const { propertyFilters } = this.state;
    const current = path[path.length - 1];
    const permission = current.permissions || [];
    const disabled = element.element.status === 'not_available' ||
      element.element.isAvailable === false;
    const items = element.versions.items;
    const maxItems = element.versions.count || items.length;
    const maxPage = Math.ceil(maxItems / itemsForPage);
    const schema = element.element.schema;
    const parentColumns = schema.config.properties.filter(prop => (
      prop.type === 'reference' && prop.config.key === current.absolutPath
    ));

    let data;
    let parentColumn;
    let useBackendPagination = true;
    // если есть несколько классификаторов и выбрано иерархическое отображение
    if (displayMode === DISPLAY_MODE.TREE_VIEW) {
      const result = getTreeData(reference_data, element, parentColumns, parentColumn, this.state.currentParent);
      data = result.data;
      useBackendPagination = result.useBackendPagination;
    } else {
      data = items.map(v => Object.assign({ $$meta: v, title: v.title }, v.version.object));
    }

    const EditModal = this.props.EditModal || NewElementModal;

    return (
      <div style={{ paddingTop: 20 }}>
        <h1>{element.element.fullTitle}</h1>
        <div style={{ marginTop: '20px' }}>
          <div className="aui-buttons">
            <DetailsToggle {...this.props} style={{ width: '251px' }} />
            <CheckDeduplicationButton
              disabled={!permission.includes('create_entry') || disabled}
              onClick={() => actions.deduplicationAsync(splat)}
            />
            <DeduplicationLinkButton />
            <button
              className="sh-btn btn"
              disabled={!permission.includes('edit_element') || disabled}
              onClick={actions.openElementModal}
            >Редактировать</button>
            <MoveElementButton
              disabled={!permission.includes('hard_admin') || disabled}
            />
            <RemoveOrRestoreButton />
          </div>
          <div className="aui-buttons">
            <NewRecordButton />
            <ExportDropdown
              element={element}
              parentColumn={parentColumn}
              pageSetting={pageSetting}
              order={{ [this.state.sortColumn]: this.state.sortType }}
              showDeleted={this.props.showNotAvailable}
            />
            <ImportDropdown element={element} />
          </div>
          <div className="aui-buttons">
            <SettingsButton />
          </div>
        </div>

        {this.props.itemDataIsVisible && <ItemData item={element.element} />}

        <div className={styles.secondControlBlock}>
          <div className="element-date-picker">
            <DatePicker
              label="Дата:"
              specifyTime
              onChange={actions.changeElementDate}
              value={formatDate(element.date)}
            />
          </div>
          <div>
            <PropertyFilter
              propertyFilters={propertyFilters}
              element={this.props.element}
              properties={element.element.schema.config.properties}
              onChange={this.onPropertyFiltersChange}
              onSet={this.setPropertyFilters}
            />
          </div>
        </div>

        <EditModal
          isOpen={modalsState.element}
          onSubmit={this.editElement}
          onGlobalTypeSave={actions.createGlobalType}
          onClose={actions.closeElementModal}
          element={element.element}
          schema={schema}
        />

        <Checkbox
          style={{ paddingLeft: 20 }}
          onChange={this.props.actions.toggleShowNotAvailable}
          checked={this.props.showNotAvailable}
          label={'Отобразить удаленные записи'}
        />

        <div style={{ paddingTop: 20, position: 'relative' }}>
          {!isEmpty(parentColumns) &&
            <DisplayModeSwitcher
              parentColumns={parentColumns}
              currentParent={this.state.currentParent}
              handleParentChange={this.handleParentChange}
              displayMode={displayMode}
              handleDisplayModeChange={actions.changeDisplayMode}
            />
          }
          {this.props.isSaving &&
            <Preloader />
          }
          <RecordTable
            inlineRemove={permission.includes('delete_entry')}
            isEditable
            data={data}
            columns={columns}
            element={element}
            date={createValidDate(element.date)}
            schema={schema}
            absolutPath={current.absolutPath}
            hasChildColumns={parentColumns.length > 0}
            itemsForPage={itemsForPage}
            useBackendPagination={useBackendPagination}
            conditionFilters={conditionFilters}
            onSortChange={this.onSortChange}
            sortColumn={this.state.sortColumn}
            sortAscending={this.state.sortType === 'asc'}
          />
          {useBackendPagination &&
            <Paginator currentPage={page} maxPage={maxPage} setPage={this.props.actions.changePage} />
          }
          <p>Общее количество записей: {maxItems}</p>
          {schema.config.isInlineEditable &&
            <AuiButton
              onClick={() => this.props.startRecordCreation(element.element.absolutPath)}
            >
              Добавить запись
            </AuiButton>
          }
          {this.props.hasStagedChanges &&
            <AuiButton
              primary
              onClick={() => this.props.saveDraftsInElement(element.element.absolutPath)}
            >
              Сохранить все записи
            </AuiButton>
          }
        </div>
      </div>
    );
  }

}
