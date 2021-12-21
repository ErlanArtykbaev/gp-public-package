import permissions from 'gp-core/lib/routes/config/permissions';
import Navigation from './Navigation';

export default new Navigation({
  key: 'coreNavigation',
  title: 'Меню',
  children: [
    {
      title: 'НСИ',
      class: 'menu-nsi',
      route: 'groups',
      permissions: permissions.objects,
    },
    {
      title: 'Формирование запроса изменений',
      class: 'menu-rfc-draft',
      route: 'rfc/draft',
      permissions: permissions.rfc,
    },
    {
      title: 'Входящие запросы',
      class: 'menu-rfc-inbox',
      route: 'rfc/inbox',
      permissions: permissions.rfc,
    },
    {
      title: 'Связи',
      class: 'menu-graph',
      route: 'graph',
      permissions: permissions.rfc,
    },
    {
      title: 'Отчеты',
      class: 'menu-reports',
      route: 'reports',
      permissions: permissions.reports,
    },
    {
      key: 'defaultDropdownMenu',
      children: [
        {
          title: 'Исходящие запросы',
          route: 'rfc/outbox',
          permissions: permissions.rfc,
        },
        {
          title: 'Задачи импорта',
          route: 'rfc/import-outbox',
          permissions: permissions.rfc,
        },
        {
          title: 'Процессы',
          route: 'rfc/settings',
          permissions: permissions.rfc,
        },
        {
          title: 'Импорт Справочников',
          route: 'ref-import',
          permissions: permissions.refImport,
        },
        {
          title: 'Перекодировочные таблицы импорта',
          route: 'rfc/coding-table',
          permissions: permissions.rfc,
        },
        {
          title: 'Откат ЗНИ',
          route: 'rfc/restore',
          permissions: permissions.rfc,
        },
        {
          title: 'Пакетный контроль',
          route: 'pack-control',
          permissions: permissions.packControl,
        },
      ],
    },
  ],
});
