import React from 'react';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import without from 'lodash/without';
import FilterInput from './FilterInput';

export default (props) => {
  const value = props.value || [];
  const properties = props.properties || [];

  const add = () => props.onChange(value.concat({ key: properties[0].id, type: 'equals' }));
  const remove = item => props.onChange(without(value, item));
  const change = (item, i) => {
    const res = value.slice();
    res[i] = item;
    props.onChange(res);
  };

  return (
    <div>
      {value.map((filter, i) => (
        <FilterInput
          key={filter.key || i}
          properties={properties}
          value={filter}
          onChange={f => change(f, i)}
          onRemove={() => remove(filter)}
        />
      ))}
      <div className="form-group">
        <AuiButton disabled={properties.length === 0} onClick={add}>
          Добавить фильтр
        </AuiButton>
      </div>
    </div>
  );
};
