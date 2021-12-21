import React, { PropTypes } from 'react';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import { isEmptySoft } from '@gostgroup/gp-utils/lib/functions';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

@autobind
export default class ListForm extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    value: PropTypes.array,
    error: PropTypes.string,
    onValueChange: PropTypes.func,
    references: PropTypes.shape({}),
  }

  static contextTypes = {
    validateRow: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    FormRow: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      selectedRow: null,
    };
  }

  handlePropertyChange(idx, fieldConfig, rowValue) {
    const { onValueChange, config } = this.props;
    const value = (this.props.value || []).slice();
    if (rowValue) {
      value[idx] = rowValue;
    } else {
      value.splice(idx, 1);
    }

    if (typeof onValueChange === 'function') {
      onValueChange(config, value);
    }
  }

  handleRemoveRow(idx) {
    const { config, onValueChange } = this.props;
    const value = (this.props.value || []).slice();
    value.splice(idx, 1);

    if (typeof onValueChange === 'function') {
      onValueChange(config, value);
    }
  }

  handleAddRow() {
    const { config, onValueChange, value } = this.props;
    if (typeof onValueChange === 'function') {
      onValueChange(config, (value || []).concat([{}]));
    }
  }

  rowClickHandler(event, e) {
    if (this.context.readOnly) {
      if (e.target.className === 'col-list') {
        this.setState({ selectedRow: event.props.data.id, showModal: true });
      }
    } else {
      this.setState({ selectedRow: event.props.data.id });
    }
  }

  showModal() {
    this.setState({ showModal: true });
  }

  closeModal(values) {
    if (isEmptySoft(values[this.state.selectedRow])) {
      this.handleRemoveRow(this.state.selectedRow);
    }
    this.setState({ showModal: false });
  }

  render() {
    const { config, value, error, references } = this.props;
    const { FormRow, validateRow, readOnly } = this.context;
    const rowConfig = config.typeConfig;

    const rows = (value || []).filter(row => !!row).map((row, index) => {
      const FormRowComponent = row.type === 'list' ? ListForm : FormRow;
      return (
        <FormRowComponent
          key={index}
          config={rowConfig}
          value={row}
          references={references}
          error={validateRow(rowConfig, row, references)}
          onRemove={this.handleRemoveRow.bind(this, index)}
          onValueChange={this.handlePropertyChange.bind(this, index)}
        />
      );
    });

    const className = cx('form__list', {
      'form__list--error': error,
    });

    return (
      <fieldset className={className}>
        {config.title ? <h4>{config.title}</h4> : null}
        {rows}
        {error && !readOnly ? <div className="form__error">{error}</div> : null}
        {(!readOnly) &&
          <AuiButton default onClick={this.handleAddRow}>Добавить</AuiButton>
        }
      </fieldset>
    );
  }
}
