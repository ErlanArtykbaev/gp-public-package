import React from 'react';
import { onlyUpdateForKeys } from 'recompose';
import { validateRow } from '@gostgroup/gp-forms/lib/validate/index.js';
import BaseFormRow, { FormRowLayoutPropTypes } from '@gostgroup/gp-forms/lib/row/FormRow';
import { getRowConfig } from '@gostgroup/gp-forms/lib/helpers';
import cx from 'classnames';
import cellPropTypes from './cellPropTypes';
import '../styles/recordTable.global.scss';
import TableEditor from './TableEditor';

const warnNoHandler = () => console.warn('metadata.onChange is not specified for field'); // eslint-disable-line no-console;

// TODO with Input permissions
const EditLayout = props => (
  <div className={cx('record-table__editor', { 'with-info': !!props.info })}>
    {props.input}
    {props.info && <div className="info">{props.info}</div>}
  </div>
);

EditLayout.propTypes = FormRowLayoutPropTypes;

const EditableCell = (props, context) => {
  const { data, metadata } = props;
  const property = metadata.itemSchema;
  const onChange = context.onChange || warnNoHandler;
  const FormRow = property.type === 'table' ? TableEditor : BaseFormRow;

  // TODO move validateRow into FormRow
  return (
    <FormRow
      Layout={EditLayout}
      key={property.id}
      // NOTE иначе не работает
      config={getRowConfig(context.schema, property)} // property
      value={data}
      error={validateRow(property, data, [])}
      onValueChange={onChange}
    />
  );
};

EditableCell.propTypes = cellPropTypes();
EditableCell.contextTypes = {
  onChange: React.PropTypes.func,
  schema: React.PropTypes.shape({}),
};

export default onlyUpdateForKeys(['data', 'metadata'])(EditableCell);
