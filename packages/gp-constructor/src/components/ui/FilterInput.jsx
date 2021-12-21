import React from 'react';
import { PropertySelector, FilterTypeSelector } from '@gostgroup/gp-ui-components/lib/PropertyFilter';

export default props => (
  <div className="form-group">
    <PropertySelector
      value={props.value.key}
      properties={props.properties}
      onChange={key => props.onChange({ ...props.value, key })}
    />
    <FilterTypeSelector
      value={props.value.type}
      onChange={type => props.onChange({ ...props.value, type })}
    />
    <i className="fa fa-close inline-block property-filter__remove" onClick={props.onRemove} />
  </div>
);
