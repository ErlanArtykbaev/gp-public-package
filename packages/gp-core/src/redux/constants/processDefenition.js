export const DEFAULT_STEP_TEMPLATE = {
  sids: [],
  requiredCompletionCount: 1,
  collapsed: false,
  stepType: 'users',
  parallel: false,
};

export const TYPE_OPTIONS = [
  {
    label: 'Пользователи',
    value: 'users',
    sidType: 'user',
    placeholder: 'Выберите пользователя',
    placeholderMany: 'Выберите пользователей',
  },
  {
    label: 'Роли',
    value: 'roles',
    sidType: 'role',
    placeholder: 'Выберите роль',
    placeholderMany: 'Выберите роли',
  },
  {
    label: 'Организации',
    value: 'organizations',
    sidType: 'organization',
    placeholder: 'Выберите организацию',
    placeholderMany: 'Выберите организации',
  },
];
