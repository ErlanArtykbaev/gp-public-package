import { TYPES } from '../constants/nsiTypes';
import editor from './Editor';
import form from './form/EgrulForm';

export default {
  id: TYPES.EGRUL,
  title: 'ЕГРЮЛ',
  editor,
  defaultConfig: {
    defaultValue: {},
  },
  form,
  innerProperties: [
    {
      value: 'name',
      label: 'Название организации',
    },
    {
      value: 'inn',
      label: 'ИНН',
    },
    {
      value: 'opf',
      label: 'ОПФ',
    },
    {
      value: 'ogrn',
      label: 'ОГРН',
    },
    {
      value: 'kpp',
      label: 'КПП',
    },
    {
      value: 'okpo',
      label: 'ОКПО',
    },
    {
      value: 'address',
      label: 'Адрес организации',
    },
  ],
};
