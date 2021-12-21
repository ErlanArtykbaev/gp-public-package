import React, { PropTypes } from 'react';
import { Form } from '@gostgroup/gp-forms';
import TopLabelLayout from '@gostgroup/gp-forms/lib/layouts/TopLabelLayout';
import BasicWrapperLayout from '@gostgroup/gp-forms/lib/layouts/wrapper/BasicWrapperLayout';

export default function DeduplicationParams(props) {
  const { array_attribute_parameters, data, onChange } = props;
  const properties = (array_attribute_parameters || []).map(prop => ({
    /*
    * id: "title"
    * required: true
    * title: "Наименование"
    * type: "string"
    * */
    id: prop.key,
    title: prop.imya_argumenta,
    type: prop.tip_argumenta,
    required: true,
    config: {},
  }));

  const attribute_parameters_schema = {
    config: {
      properties,
    },
    types: [],
  };

  return (
    <Form
      config={attribute_parameters_schema}
      data={data}
      onChange={onChange}
      WrapperLayout={BasicWrapperLayout}
      FormLayout={TopLabelLayout}
    />
  );
}

DeduplicationParams.propTypes = {
  data: PropTypes.shape({}),
  onChange: PropTypes.func,
  array_attribute_parameters: PropTypes.arrayOf(PropTypes.shape({})),
};
