// import permissions from 'gp-core/lib/routes/config/permissions';
import Navigation from './Navigation';

export default new Navigation({
  key: 'reportNavigation',
  title: 'Отчеты',
  children: [
    {
      route: '/reports/operations',
      title: 'По проводимым операциям',
      permissions: ['hard_admin'],
    }, {
      route: '/reports/imports',
      title: 'По импорту',
      permissions: ['hard_admin'],
    }, {
      route: '/reports/users',
      title: 'По отправленным ЗНИ',
      permissions: ['hard_admin'],
    }, {
      route: '/reports/experts',
      title: 'По отклонённым и утвержденным ЗНИ',
      permissions: ['hard_admin'],
    }, {
      route: '/reports/rfc-restore',
      title: 'По откату ЗНИ',
      permissions: ['hard_admin'],
    }, {
      route: '/reports/user-comments',
      title: 'По комментариям к ЗНИ',
    }, {
      route: '/reports/quality',
      title: 'По контролю качества НСИ',
      permissions: ['hard_admin'],
    }, {
      route: '/reports/user-log',
      title: 'Журнал действий пользователя',
      permissions: ['hard_admin'],
    }, {
      route: '/reports/security',
      title: 'О попытках вторжения',
      permissions: ['hard_admin'],
    },
  ],
});
