import React, { PropTypes } from 'react';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import RecordTable from '@gostgroup/gp-core/lib/components/objects/recordTable';
import { upsert, remove } from '@gostgroup/gp-utils/lib/immutable/array';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import isInlineEditable from '@gostgroup/gp-nsi-utils/lib/schema/isInlineEditable';
import styles from './TableForm.scss';

export default class TableForm extends React.Component {

  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.shape({})),
    onValueChange: PropTypes.func,
    config: PropTypes.shape({}),
    readOnly: PropTypes.bool,
  }

  static contextTypes = {
    element: PropTypes.shape({}),
    readOnly: PropTypes.bool,
  }

  handleAddRow = () => {
    const { config, onValueChange, value } = this.props;
    if (typeof onValueChange === 'function') {
      onValueChange(config, (value || []).concat([{}]));
    }
  }

  handleChange = (absolutPath, version, patch, data) => {
    const { config, onValueChange, value } = this.props;
    if (typeof onValueChange === 'function') {
      const index = data.$$key;
      const cleanValue = omit(merge({}, value[index], patch), 'metadata');
      onValueChange(config, upsert(value, index, cleanValue));
    }
  }

  handleRemove = (absolutPath, data) => {
    const { config, onValueChange, value } = this.props;
    if (typeof onValueChange === 'function') {
      const index = data.$$key;
      onValueChange(config, remove(value, index));
    }
  }

  render() {
    const { config, value } = this.props;
    const readOnly = this.props.readOnly || this.context.readOnly;
    return (
      <div className={styles.tableForm}>
        {/* <label htmlFor={config.id}>
          {config.title}
          {config.required ? <span className="aui-icon icon-required" /> : null}
        </label> */}
        <RecordTable
          data={value}
          schema={isInlineEditable(config.typeConfig)}
          element={this.context.element}
          isEditable={!readOnly}
          inlineRemove={!readOnly}
          onChange={this.handleChange}
          onRemove={this.handleRemove}
        />
        {!readOnly && <AuiButton onClick={this.handleAddRow} style={{ marginTop: 10 }}>Добавить строку</AuiButton>}
      </div>
    );
  }
}
