import {
  REST_API_FACTORY, DADATA_API_FACTORY,
} from './factories.js';

export const SessionService = REST_API_FACTORY.createApiServiceAdapter('session');
export const HealthService = REST_API_FACTORY.createApiServiceAdapter('status/health');
export const RootService = REST_API_FACTORY.createApiServiceAdapter('');
export const AuthService = REST_API_FACTORY.createApiServiceAdapter('auth');
export const ConfigService = REST_API_FACTORY.createApiServiceAdapter('config');
export const LogoutService = REST_API_FACTORY.createApiServiceAdapter('logout');
export const SysInfoService = REST_API_FACTORY.createApiServiceAdapter('sys-info');
export const RolesService = REST_API_FACTORY.createApiServiceAdapter('roles/base_fields');
export const GroupService = REST_API_FACTORY.createApiServiceAdapter('group');
export const TreeService = REST_API_FACTORY.createApiServiceAdapter('group/nsi');
export const ElementService = REST_API_FACTORY.createApiServiceAdapter('element');
export const ItemsService = REST_API_FACTORY.createApiServiceAdapter('items');
export const SearchService = REST_API_FACTORY.createApiServiceAdapter('search');
export const GraphService = REST_API_FACTORY.createApiServiceAdapter('graph');
export const RecordService = REST_API_FACTORY.createApiServiceAdapter('item');
export const ValidateRecordService = REST_API_FACTORY.createApiServiceAdapter('validate-item');
export const ProcessImportService = REST_API_FACTORY.createApiServiceAdapter('process-import-map');
export const ItemTitlesService = REST_API_FACTORY.createApiServiceAdapter('item_titles');
export const KettleService = REST_API_FACTORY.createApiServiceAdapter('kettle');
export const ProcessesService = REST_API_FACTORY.createApiServiceAdapter('processes');
export const ProcessesMetaService = REST_API_FACTORY.createApiServiceAdapter('all-processes-meta');
export const ProcessesImportService = REST_API_FACTORY.createApiServiceAdapter('processes-import');
export const GlobalTypeTitlesService = REST_API_FACTORY.createApiServiceAdapter('global_type_titles');
export const GlobalTypeService = REST_API_FACTORY.createApiServiceAdapter('global_type');
export const UnsubscribeService = REST_API_FACTORY.createApiServiceAdapter('unsubscribe');
export const SubscribeService = REST_API_FACTORY.createApiServiceAdapter('subscribe');

//
export const ReferencesForEditService = REST_API_FACTORY.createApiServiceAdapter('item_titles_4_dynamic_edit');
export const ReferencesForViewService = REST_API_FACTORY.createApiServiceAdapter('item_titles_4_view');
export const RfcReferencesService = REST_API_FACTORY.createApiServiceAdapter('item_rfc_titles');
//

// Для RFC
export const DeleteGroupService = REST_API_FACTORY.createApiServiceAdapter('delete-group');
export const DeleteEntryService = REST_API_FACTORY.createApiServiceAdapter('delete-entry');
export const DeleteElementService = REST_API_FACTORY.createApiServiceAdapter('delete-element');
export const RestoreGroupService = REST_API_FACTORY.createApiServiceAdapter('restore-group');
export const RestoreEntryService = REST_API_FACTORY.createApiServiceAdapter('restore-entry');
export const RestoreElementService = REST_API_FACTORY.createApiServiceAdapter('restore-element');
export const RfcRemoveService = REST_API_FACTORY.createApiServiceAdapter('rfc-remove');
export const RfcRemoveRestoreService = REST_API_FACTORY.createApiServiceAdapter('rfc-remove-restore');
export const RfcActionService = REST_API_FACTORY.createApiServiceAdapter('action');
// Обслуживает только POST и PUT
export const RfcInboxProcessService = REST_API_FACTORY.createApiServiceAdapter('rfc-inbox');
export const RfcInboxErrorsService = REST_API_FACTORY.createApiServiceAdapter('rfc-inbox-errors-p');
export const RfcIncomeService = REST_API_FACTORY.createApiServiceAdapter('rfc-inbox-p');
export const RfcOutcomeService = REST_API_FACTORY.createApiServiceAdapter('rfc-outcome-p');
export const RfcImportOutcomeService = REST_API_FACTORY.createApiServiceAdapter('rfc-outcome-import-p');
export const RfcItemService = REST_API_FACTORY.createApiServiceAdapter('rfc-item');
export const RfcItemsService = REST_API_FACTORY.createApiServiceAdapter('rfc-items');
export const RfcDuplicateService = REST_API_FACTORY.createApiServiceAdapter('rfc-dudlicate');
export const RfcExistDuplicateService = REST_API_FACTORY.createApiServiceAdapter('rfc-exist-dudlicate');
export const RfcNotDuplicateService = REST_API_FACTORY.createApiServiceAdapter('rfc-not-dudlicate');

export const RfcRestoredItemsService = REST_API_FACTORY.createApiServiceAdapter('rfc-restored-items');
export const RfcRestoreService = REST_API_FACTORY.createApiServiceAdapter('rfc-restore');
export const ApproversService = REST_API_FACTORY.createApiServiceAdapter('approvers');
export const UsersService = REST_API_FACTORY.createApiServiceAdapter('users');
export const RfcRolesService = REST_API_FACTORY.createApiServiceAdapter('roles/approve_rfc');
export const RfcOrganizationsService = REST_API_FACTORY.createApiServiceAdapter('orgs');

export const RfcCodingTableService = REST_API_FACTORY.createApiServiceAdapter('rfc-coding-table');
export const RfcCodingTableItemsService = REST_API_FACTORY.createApiServiceAdapter('rfc-coding-table-items');
/**
 * @example
 * Возвращает все данные по одной строке
 * {"perPage":2,"count":1416,"page":1,"items":[
 * {"existEntryId":1974612,"extSystemEntryId":"6_7.6.2017 10"}
 * ,
 * {"existEntryId":1974706,"extSystemEntryId":"6_7.6.2017 11"}
 * ]}
 */

// history
export const ProcessHistoryService = REST_API_FACTORY.createApiServiceAdapter('process/history');
export const RfcProcessHistoryService = REST_API_FACTORY.createApiServiceAdapter('rfc-process/history');
export const RfcSubProcessHistoryService = REST_API_FACTORY.createApiServiceAdapter('rfc-sub-process/history');

/**
 * @example
 * Возвращает все данные по одной записи включая reference-поля
 * RecursiveItemService.path(absolutPath).get({ id: 500, depth: 2, json: true });
 */
export const RecursiveItemService = REST_API_FACTORY.createApiServiceAdapter('recursive/items');
/**
 * @example
 * То же, но отдает несколько записей за раз
 * MuttlRecursiveItemService.path(absolutPath).get({ ids: '500,501', depth: 2, json: true });
 */
export const MultiRecursiveItemService = REST_API_FACTORY.createApiServiceAdapter('recursive/manyitems');
/**
 * @example
 * ValuesService.path(elementPath).get({ key: 'title '});
 * ValuesService.path(elementPath).get({ key: 'complex_field/title'});
 * // => ['title1', 'title2', 'title4']
 */
export const ValuesService = REST_API_FACTORY.createApiServiceAdapter('values');

export const RecursiveSchemaService = REST_API_FACTORY.createApiServiceAdapter('recursive/schema');
export const ReportService = REST_API_FACTORY.createApiServiceAdapter('report');
export const PackageControlService = REST_API_FACTORY.createApiServiceAdapter('package-control');
export const RfcInboxService = REST_API_FACTORY.createApiServiceAdapter('inbox');
export const RfcDraftService = REST_API_FACTORY.createApiServiceAdapter('draft-rfc');
export const RfcDeleteService = REST_API_FACTORY.createApiServiceAdapter('rfc-delete-request');
export const RfcRequestService = REST_API_FACTORY.createApiServiceAdapter('rfc-request');
export const ElementMoveService = REST_API_FACTORY.createApiServiceAdapter('move_element');
export const ClassifierService = REST_API_FACTORY.createApiServiceAdapter('classifier');
export const DeduplicationAsyncService = REST_API_FACTORY.createApiServiceAdapter('duplication-post-async');
export const DeduplicationResultLinkService = REST_API_FACTORY.createApiServiceAdapter('duplication-result-link');


// Сервис обращающийся к DaData за подсказками по адресам
export const AddressSuggestionsService = DADATA_API_FACTORY.createApiServiceAdapter('suggest/address');
export const CompanySuggestionsService = DADATA_API_FACTORY.createApiServiceAdapter('suggest/party');
