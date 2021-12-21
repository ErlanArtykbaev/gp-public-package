import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';

import applyOperator from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/applyOperator';
import findRuleGroup from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/findRuleGroup';
import { TYPES } from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/types';
import CONDITIONS from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/conditions';

import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import Input from '../../ui/Input';
import { updateObjectName, updateObjectId } from '../../../models/common';
import DependencyEditorItem from './DependencyEditorItem';

@autobind
export default class DependencyEditor extends React.Component {

  static propTypes = {
    dependency: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    checkValidate: PropTypes.func,
    properties: PropTypes.arrayOf(PropTypes.shape({})),
  }

  constructor() {
    super();

    this.applyAnd = this.applyOperator.bind(this, TYPES.AND);
    this.applyOr = this.applyOperator.bind(this, TYPES.OR);
    this.applyNot = this.applyOperator.bind(this, TYPES.NOT);
  }

  state = {
    selected: null,
  }

  onNameChange(newName) {
    const props = this.props;

    const newPropType = updateObjectName(props.dependency, newName);
    props.onChange(newPropType);
    this.checkValidate(newPropType);
  }

  onIdChange(newId) {
    const props = this.props;

    const newPropType = updateObjectId(props.dependency, newId);
    props.onChange(newPropType);
    this.checkValidate(newPropType);
  }

  onTypeChange(type) {
    const dependency = this.props.dependency.set('type', type);
    this.props.onChange(dependency);
  }

  onRulesChange(data, block) {
    if (block) {
      const { dependency } = this.props;
      const rules = dependency.get('rules');
      rules[block] = data;
      this.props.onChange(this.props.dependency.set('rules', rules));
    } else {
      this.props.onChange(this.props.dependency.set('rules', data));
    }
  }

  onRuleChange(uuid, rule) {
    const { dependency } = this.props;
    const rules = dependency.get('rules');
    const foundRule = findRuleGroup(uuid, rules);
    const path = foundRule.path;
    this.onRulesChange(rules.setIn(path, rule));
  }

  applyOperator(type) {
    const { dependency } = this.props;
    const selectedRuleGroup = findRuleGroup(this.state.selected, dependency.get('rules'));
    const path = selectedRuleGroup.path;
    this.props.onChange(
      dependency.update('rules', rules => applyOperator(rules, type, path))
    );
  }

  delete() {
    const { dependency } = this.props;
    const selectedRuleGroup = findRuleGroup(this.state.selected, dependency.get('rules'));
    this.props.onChange(
      this.props.dependency.update('rules', rules => rules.deleteIn(selectedRuleGroup.path))
    );
    this.setState({ selected: null });
  }

  checkValidate(propType) {
    const idError = propType.getIn(['id', 'error']);
    const titleError = propType.getIn(['title', 'error']);
    const isValid = (!idError && !titleError);
    this.props.checkValidate('schema_data', isValid);
  }

  renderHeading() {
    const selectedType = this.props.dependency.get('type');
    const easyButton = (
      <span
        className={selectedType === 'easy' ? 'dependency-type-active' : 'dependency-type'}
        onClick={() => this.onTypeChange('easy')}
      >
        простой
      </span>
    );
    const complexButton = (
      <span
        className={selectedType === 'complex' ? 'dependency-type-active' : 'dependency-type'}
        onClick={() => this.onTypeChange('complex')}
      >
        продвинутый
      </span>
    );
    return (
      <div className="panel-heading">
        Способ: {easyButton} {complexButton}
      </div>
    );
  }

  renderBody({ dependency }) {
    const name = dependency.get('title');
    const selectedType = this.props.dependency.get('type');
    const rules = dependency.get('rules');
    const nameType = name.get('value');

    return (
      <div>
        <form>
          <Input
            value={nameType}
            error={name.get('error')}
            label="Название зависимости"
            onChange={n => this.onNameChange(n)}
          />
          {selectedType === 'easy' ? this.renderEasy(rules) : this.renderComplex(rules)}
        </form>
      </div>
    );
  }

  renderComplex(rules) {
    return (
      <textarea
        className="form-control"
        rows={12}
        value={rules.get('parsed')}
        onChange={e => this.onRulesChange(e.target.value, 'parsed')}
      />
    );
  }

  renderEasy(rules) {
    return (
      <div>
        <div className="button-group">
          <AuiButton
            type="button"
            onClick={() => this.applyAnd()}
            style={{ marginBottom: 20 }}
            disabled={!this.state.selected}
          >
            И
          </AuiButton>
          <AuiButton
            type="button"
            onClick={() => this.applyOr()}
            style={{ marginBottom: 20 }}
            disabled={!this.state.selected}
          >
            ИЛИ
          </AuiButton>
          <AuiButton
            type="button"
            onClick={() => this.applyNot()}
            style={{ marginBottom: 20 }}
            disabled={!this.state.selected}
          >
            НЕ
          </AuiButton>
          <AuiButton
            type="button"
            onClick={() => this.delete()}
            style={{ marginBottom: 20 }}
            disabled={!this.state.selected}
          >
            Удалить
          </AuiButton>
        </div>
        <div><b>Если:</b></div>
        <DependencyEditorItem
          rule={rules.get('if')}
          onChange={this.onRuleChange}
          conditions={CONDITIONS.if.base}
          autoConditions={CONDITIONS.if.auto}
          onSelect={rule => this.setState({ selected: rule.get('uuid') })}
          selected={this.state.selected}
          properties={this.props.properties}
        />
        <div><b>То:</b></div>
        <DependencyEditorItem
          rule={rules.get('then')}
          conditions={CONDITIONS.then.base}
          autoConditions={CONDITIONS.then.auto}
          onChange={this.onRuleChange}
          onSelect={rule => this.setState({ selected: rule.get('uuid') })}
          selected={this.state.selected}
          properties={this.props.properties.filter(p => !p.parentId)}
        />
        {/* <div><b>Иначе:</b></div>
        <DependencyEditorItem
          rule={rules.get('else')}
          conditions={CONDITIONS.else.base}
          autoConditions={CONDITIONS.else.auto}
          onChange={this.onRuleChange}
          onSelect={rule => this.setState({ selected: rule.get('uuid') })}
          selected={this.state.selected}
          properties={this.props.properties}
        />*/}
      </div>
    );
  }

  render() {
    return (
      <div className="panel panel-default">
        {this.renderHeading(this.props)}
        <div className="panel-body">
          <div>
            {this.renderBody(this.props)}
          </div>
        </div>
      </div>
    );
  }

}
