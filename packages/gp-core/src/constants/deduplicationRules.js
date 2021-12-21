export default {
  rules: {
    integer: [{
      key: '',
      title: ''
    }, {
      title: 'Строгое сравнение',
      key: '===',
      array_attribute_parameters: []
    }],
    string: [{
      key: '',
      title: ''
    }, {
      title: 'Строгое сравнение',
      key: '===',
      array_attribute_parameters: []
    }, {
      title: 'Расстояние Д-Л',
      key: 'd_l',
      array_attribute_parameters: []
    }, {
      title: 'Число опечаток',
      key: 'chng',
      array_attribute_parameters: [{
        imya_argumenta: 'Опечаток не больше',
        tip_argumenta: 'integer',
        key: 'typo_numbers'
      }]
    }],
    date: [{
      key: '',
      title: ''
    }]
  },
  types: {
    1: 'integer',
    2: 'string',
    3: 'date'
  },
  gruppovie_pravila: [{
    key: 'min',
    title: 'Худшее соответствие'
  }, {
    key: 'max',
    title: 'Лучшее соответствие'
  }, {
    key: 'avg',
    title: 'Среднее взвешенное',
    parametri_atributov: [{
      imya_argumenta: 'Вес',
      tip_argumenta: 'string',
      key: 'weight'
    }],
    parametri_gruppovoi_funktsii: []
  }]
};
