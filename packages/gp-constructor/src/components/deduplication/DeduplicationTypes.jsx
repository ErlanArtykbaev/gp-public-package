import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Table from '@gostgroup/gp-ui-components/lib/SimpleTable';
import DeduplicationProperty from './DeduplicationProperty';
import DeduplicationGroupRules from './DeduplicationGroupRules';

@autobind
export default class DeduplicationTypes extends Component {

  static propTypes = {
    onDisabledChange: PropTypes.func,
    deduplication: PropTypes.shape({}),
    deduplicationCursor: PropTypes.shape({}),
    showRule: PropTypes.func,
    type: PropTypes.shape({}),
    types: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    let default_rule;
    let group_data;
    const { type, deduplication, deduplicationCursor } = props;
    const gruppovie_pravila = deduplication.gruppovie_pravila;
    const groups_data = deduplicationCursor.get('gruppovie_pravila');

    if (groups_data) {
      group_data = groups_data.find(prop => prop.get('key') === type.getIn(['id', 'value']));
      if (group_data) {
        group_data = group_data.toJS();
        default_rule = gruppovie_pravila.find(prop => prop.key === group_data.rule);
      }
    }

    const propertiesDisabled = deduplication.deduplicationProperties.toJS().map(() => true);

    this.state = {
      group_params: undefined,
      group_rule: default_rule,
      group_data: group_data || {},

      propertiesDisabled,
      groupDisabled: false,
    };
  }

  onPropDisabledChange(index, isDisabledProperty) {
    const { propertiesDisabled } = this.state;
    propertiesDisabled[index] = isDisabledProperty;

    this.setState({ propertiesDisabled }, () => this.validate());
  }

  onGroupDisabledChange(groupDisabled) {
    this.setState({ groupDisabled }, () => this.validate());
  }

  validate() {
    const { groupDisabled, propertiesDisabled } = this.state;
    const deduplicationTypesValid = !groupDisabled && !propertiesDisabled.find(p => p === true);
    this.props.onDisabledChange(!deduplicationTypesValid);
  }

  changeRule(group_rule) {
    let { propertiesDisabled, groupDisabled } = this.state;
    const { deduplication } = this.props;

    if (group_rule && group_rule.key === 'test') {
      propertiesDisabled = deduplication.deduplicationProperties.toJS().map(() => true);
      groupDisabled = true;
      this.props.onDisabledChange(true);
    } else {
      this.props.onDisabledChange(false);
    }

    this.setState({ group_rule, propertiesDisabled, groupDisabled });
  }

  render() {
    const { type, deduplicationCursor, deduplication, showRule, types } = this.props;
    const { deduplicationProperties } = deduplication;
    const properties = deduplicationCursor.cursor('properties');
    const groups_data = deduplicationCursor.get('gruppovie_pravila');
    let group_data = {};
    if (groups_data) {
      group_data = groups_data.find(prop => prop.get('key') === type.getIn(['id', 'value']));
      group_data = group_data ? group_data.toJS() : {};
    }

    const props = deduplicationProperties.map((p, i) =>
      <DeduplicationProperty
        key={i}
        deduplication={deduplication}
        types={types}
        prop={p}
        type={type}
        showRule={showRule}
        group_rule={this.state.group_rule}
        deduplicationCursor={deduplicationCursor}
        properties={properties}
        onDisabledChange={() => this.onPropDisabledChange(i)}
      />
    ).filter(Boolean).toArray();

    if (!props.length) {
      return null;
    }

    return (
      <div className="col-lg-12" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="panel panel-default">
          <div className="panel-heading">
            {type.getIn(['title', 'value'])}
          </div>
          <div className="panel-body">
            <Table bordered striped>
              <thead>
                <tr>
                  <th>Атрибут</th>
                  <th>Функция сравнения атрибутов</th>
                  <th>Параметры функции сравнения атрибутов</th>
                  <th>Параметры функции сравнения версий</th>
                </tr>
              </thead>
              <tbody>

                {props}

                <DeduplicationGroupRules
                  gruppovie_pravila={deduplication.gruppovie_pravila}
                  deduplicationCursor={deduplicationCursor}
                  name="gruppovie_pravila"
                  data={group_data}
                  type={type}
                  properties={properties}
                  changeRule={this.changeRule}
                  default_rule={this.state.group_rule}
                  onChange={data => type.update('gruppovie_pravila', data)}
                  onDisabledChange={this.onGroupDisabledChange}
                />
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

}
