import { TYPES } from '../constants/nsiTypes';
import editor from './Editor';
import form from './form/FiasForm';

export default {
  id: TYPES.FIAS,
  title: 'ФИАС',
  editor,
  defaultConfig: {
    defaultValue: {},
  },
  innerProperties: [
    {
      value: 'unrestricted_value',
      label: 'Полный адрес',
    },
    {
      value: 'postal_code',
      label: 'Индекс',
    },
    {
      value: 'city',
      label: 'Город',
    },
    {
      value: 'city_area',
      label: 'Административный округ',
    },
    {
      value: 'city_district',
      label: 'Район города',
    },
    {
      value: 'street',
      label: 'Улица',
    },
    {
      value: 'house',
      label: 'Дом',
    },
    {
      value: 'block',
      label: 'Строение',
    },
    {
      value: 'additional',
      label: 'Дополнение к номеру дома',
    },
  ],
  form,
};
