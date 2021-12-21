import React, { Component, PropTypes } from 'react';
import Cursor from 'immutable/contrib/cursor';
import Immutable from 'immutable';
import DeduplicationParams from './DeduplicationParams';

export const noRule = {
  key: '',
  title: '',
};

export default class DeduplicationGroupRules extends Component {

  static propTypes = {
    type: PropTypes.shape({}),
    default_rule: PropTypes.shape({}),
    onDisabledChange: PropTypes.func,
    deduplicationCursor: PropTypes.shape({}),
    data: PropTypes.shape({}),
    name: PropTypes.string,
    changeRule: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.onChangeGroupRule = this.onChangeGroupRule.bind(this);
    this.onChangeParamsFunction = this.onChangeParamsFunction.bind(this);

    this.state = {
      rule: props.default_rule,
    };
  }

  onChangeGroupRule(e) {
    const { name, gruppovie_pravila, changeRule } = this.props;
    let { deduplicationCursor } = this.props;
    const value = e.target.value;
    const rule = gruppovie_pravila.find(prop => prop.key === value);
    const id = this.getId();

    deduplicationCursor = deduplicationCursor.update('properties', (props) => {
      props = (!props) ? [] : props.toJS();
      props.map(prop => delete prop.attribute_version);

      return Cursor.from(Immutable.fromJS(props));
    });

    deduplicationCursor.update(name, (props) => {
      props = (!props) ? [] : props.toJS();

      let rule = props.find(p => p.key === id);
      if (!rule) {
        rule = { rule: value, key: id };
        props.push(rule);
      } else {
        delete rule.attribute_parameters;
        rule.rule = value;
      }
      props = props.filter(opt => opt.rule !== '');
      return Cursor.from(Immutable.fromJS(props)).deref();
    });

    changeRule(rule);
    this.setState({ rule });
  }

  onChangeParamsFunction(data, cleanData, isValid = true) {
    this.props.onDisabledChange(!isValid);

    const { deduplicationCursor, name } = this.props;
    const id = this.getId();
    deduplicationCursor.update(name, (group_params) => {
      group_params = (!group_params) ? [] : group_params.toJSON();
      const rule = group_params.find(p => p.key === id);
      if (rule) {
        rule.attribute_parameters = data;
      }
      return Cursor.from(Immutable.fromJS(group_params));
    });
  }

  getId() {
    const { type } = this.props;
    return type.getIn(['id', 'value']);
  }

  render() {
    const { gruppovie_pravila, data } = this.props;
    const { rule = {} } = this.state;
    const functionsOptions = gruppovie_pravila.map((opt, index) => (
      <option key={index} value={opt.key}>
        {opt.title}
      </option>
    ));
    functionsOptions.unshift(<option key="opt_default" value="" />);

    return (
      <tr>
        <th>Групповые параметры</th>
        <td>
          <select className="form-control" value={rule.key} onChange={this.onChangeGroupRule}>
            {functionsOptions}
          </select>
        </td>
        { rule ?
          <td>
            <DeduplicationParams
              array_attribute_parameters={rule.parametri_gruppovoi_funktsii}
              data={data.attribute_parameters}
              onChange={this.onChangeParamsFunction}
            />
          </td> : <td />}
        <td />
      </tr>
    );
  }
}
