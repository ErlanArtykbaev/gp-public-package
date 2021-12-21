import React, { PropTypes } from 'react';
import { PRIMITIVE_TYPES } from '@gostgroup/gp-constructor/lib/types.js';
import dictionary from 'gp-core/lib/constants/dictionary';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';


class PropertySelector extends React.Component {

  render() {
    const options = this.props.properties.map((property, index) => <option key={index} value={property.id}>{property.title}</option>);

    if (typeof this.props.value === 'undefined') {
      options.unshift(<option selected>Выберите свойство</option>);
    }

    return (
      <select className="form-control property-filter__property inline-block" value={this.props.value} onChange={this.props.onChange}>
        {options}
      </select>
    );
  }

}

const ColorButton = ({ color, index, onClick }) => (
  <div className="aui-button color-button" style={{ backgroundColor: color }} onClick={onClick.bind(null, index, color)} />
);

class ColorPicker extends React.Component {

  colorButton(color) {
    if (color) {
      return (
        <div className="inline-block condition__selected-color">
          Выбранный цвет: <ColorButton color={color} onClick={this.props.onClick} />
        </div>
      );
    }
    return '';
  }

  render() {
    const colors = this.props.colors.map((color, index) => <ColorButton key={index} index={this.props.index} color={color} onClick={this.props.onClick} />);

    return (
      <div className="panel panel-default">
        <div style={{ height: '55px' }}>
          {colors}
          {this.colorButton(this.props.selectedColor)}
        </div>
      </div>
    );
  }

}

class ConditionElement extends React.Component {

  constructor(props) {
    super(props);

    this.addConditionStatement = this.addConditionStatement.bind(this);
    this.onPropertyChange = this.onPropertyChange.bind(this);
    this.onColorSelected = this.onColorSelected.bind(this);
    this.removeStatement = this.removeStatement.bind(this);
    this.onStatementValueChange = this.onStatementValueChange.bind(this);
    this.onStatementConditionChange = this.onStatementConditionChange.bind(this);

    this.state = {
      statements: [],
    };
  }

  render() {
    const { element, properties } = this.props;
    const selectedColor = element.color;
    const { operations } = dictionary;

    const operationsOptions = operations.map((operation, index) => <option key={index} value={operation.key}>{operation.title}</option>);

    const statements = element.statements.map((statement, index) => (
      <div key={index} className="property-filter">
        <PropertySelector properties={(properties || []).filter(p => PRIMITIVE_TYPES.includes(p.type))} value={statement.key} onChange={this.onPropertyChange.bind(null, index)} />
        <select className="form-control property-filter__condition inline-block" value={statement.condition} onChange={this.onStatementConditionChange.bind(null, index)}>
          {operationsOptions}
        </select>
        <input className="form-control inline-block" type="text" disabled={!statement.key} value={statement.value} onChange={this.onStatementValueChange.bind(null, index)} />
        <i className="fa fa-close inline-block property-filter__remove" onClick={this.removeStatement.bind(null, index)} />
      </div>
      ));

    return (
      <div>

        <div>
          <div className="inline-block">
            <h4>Правило {this.props.index + 1}</h4>
          </div>
          <div className="pull-right" onClick={this.props.onDelete.bind(null, this.props.index)}><i className="fa fa-times" /></div>
        </div>

        {statements}

        <button type="button" className="aui-button add-statement-button" onClick={this.addConditionStatement}>Добавить свойство в правило</button>

        <ColorPicker selectedColor={selectedColor} index={this.props.index} colors={this.props.colors} onClick={this.onColorSelected} />

        <hr />

      </div>
    );
  }

  addConditionStatement() {
    const { element } = this.props;
    const { statements } = element;
    statements.push({
      condition: 'equals',
    });

    this.props.onChange(element);
  }

  removeStatement(index) {
    const { element } = this.props;
    const { statements } = element;
    statements.splice(index, 1);

    this.props.onChange(element);
  }

  onPropertyChange(index, e) {
    const { element } = this.props;
    const { statements } = element;
    statements[index].key = e.target.value;

    this.props.onChange(element);
  }

  onStatementConditionChange(index, e) {
    const { element } = this.props;
    const { statements } = element;
    statements[index].condition = e.target.value;

    this.props.onChange(element);
  }

  onStatementValueChange(index, e) {
    const { element } = this.props;
    const { statements } = element;
    statements[index].value = e.target.value;

    this.props.onChange(element);
  }

  onColorSelected(index, color) {
    const { element } = this.props;
    element.color = color;

    this.props.onChange(element);
  }

}

class ConditionFilters extends React.Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    conditionFilters: PropTypes.arrayOf(PropTypes.shape({})),
  }

  constructor(props) {
    super(props);
    this.addConditionFilter = this.addConditionFilter.bind(this);
    this.removeConditionFilter = this.removeConditionFilter.bind(this);
    this.onColorSelected = this.onColorSelected.bind(this);
    this.onConditionFilterChange = this.onConditionFilterChange.bind(this);
  }

  render() {
    const colors = dictionary.colors;
    const conditionFilters = this.props.conditionFilters.map((filter, index) => (<ConditionElement
      key={index}
      index={index}
      onChange={this.onConditionFilterChange.bind(null, index)}
      onClick={this.onColorSelected}
      onDelete={this.removeConditionFilter}
      colors={colors}
      properties={this.props.properties}
      element={filter}
    />));

    return (
      <div>

        <h5>Правила для выделения записей</h5>

        {conditionFilters}

        <div style={{ marginBottom: 10 }}>
          <AuiButton primary onClick={this.addConditionFilter}>
            Добавить правило
          </AuiButton>
        </div>

      </div>
    );
  }

  addConditionFilter() {
    const { conditionFilters } = this.props;
    conditionFilters.push({ statements: [], color: '' });

    this.props.onChange(conditionFilters);
  }

  removeConditionFilter(index) {
    const { conditionFilters } = this.props;
    conditionFilters.splice(index, 1);

    this.props.onChange(conditionFilters);
  }

  onColorSelected(index, selectedColor) {
    const { conditionFilters } = this.props;
    conditionFilters[index].color = selectedColor;

    this.props.onChange(conditionFilters);
  }

  onConditionFilterChange(index, conditionFilter) {
    const { conditionFilters } = this.props;
    conditionFilters[index] = conditionFilter;

    this.props.onChange(conditionFilters);
  }
}

export default ConditionFilters;
