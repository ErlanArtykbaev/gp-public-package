import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import { autobind } from 'core-decorators';

@autobind
export default class ProcessSelectComponent extends Component {

  static propTypes = {
    selected: PropTypes.arrayOf(PropTypes.shape({})),
    items: PropTypes.shape({}),
    onChange: PropTypes.func,
    taskId: PropTypes.string,
    sidType: PropTypes.string,
    placeholder: PropTypes.string,
    stepIdx: PropTypes.number,
    multi: PropTypes.bool,
    disabled: PropTypes.bool,
  };

  onChange(value) {
    let selectValue = value.split(',');
    if (selectValue.length < 1 || (selectValue.length === 1 && selectValue[0] === '')) selectValue = [];
    const { taskId, onChange, sidType, stepIdx } = this.props;
    onChange(taskId, selectValue, sidType.toLowerCase(), stepIdx);
  }

  onChangeTree(value, multi) {
    if (!multi) {
      value = [value];
    }
    const { taskId, onChange, sidType, stepIdx } = this.props;
    onChange(taskId, value, sidType.toLowerCase(), stepIdx);
  }
  valueRender(value) {
    const { multi } = this.props;
    let element = value.label;
    if (multi && value.label.length >= 13) {
      element = (
        <span>
          {value.label.substring(0, 12)}
          <span style={{ fontSize: 10 }}>..</span>
        </span>
      );
    } else if (value.label.length >= 26) {
      let cuttedLabel = value.label.substring(0, 25);
      if (cuttedLabel[cuttedLabel.length - 1] === ' ') cuttedLabel = cuttedLabel.substring(0, 24);
      element = <div className="Select-placeholder">{cuttedLabel}...</div>;
    } else if (!multi) {
      element = <div className="Select-placeholder">{value.label}</div>;
    }
    return element;
  }

  render() {
    const { items, placeholder, selected, disabled, multi } = this.props;
    const optionsSelected = selected.map(item => item.id);
    const value = [];
    const treeValue = [];
    const options = items.map((item) => {
      const option = {
        value: item.id,
        label: item.displayName,
      };
      if (optionsSelected.indexOf(item.id) >= 0) {
        value.push(option);
        treeValue.push(item.id);
      }
      return option;
    });
    return (
      <div>
        <Select
          className="processDefinitionSelect"
          multi={multi}
          value={value}
          options={options}
          onChange={this.onChange}
          placeholder={placeholder}
          disabled={disabled}
          valueRenderer={this.valueRender}
          noResultsText="Нет записей"
          searchable={multi}
        />
      </div>
    );
  }
}
