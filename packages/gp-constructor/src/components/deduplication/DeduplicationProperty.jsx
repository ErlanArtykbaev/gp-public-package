import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Cursor from 'immutable/contrib/cursor';
import Immutable from 'immutable';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import DeduplicationParams from './DeduplicationParams';

const noRule = {
  key: '',
  title: '',
};

@autobind
export default class DeduplicationProperty extends Component {

  static propTypes = {
    onDisabledChange: PropTypes.func,
    showRule: PropTypes.func,
    deduplicationCursor: PropTypes.shape({}),
    deduplication: PropTypes.shape({}),
    prop: PropTypes.shape({}),
    type: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    const { prop, type, deduplication } = props;
    const { rules } = deduplication;
    const id = `${type.getIn(['id', 'value'])}/${prop.getIn(['id', 'value'])}`;

    this.state = {
      rules,
      id,
    };
  }

  onChangeSelect(e) {
    const { prop, deduplicationCursor } = this.props;
    const { rules, id } = this.state;

    const title = e.target.value;
    const options = rules[prop.get('type')];
    const optionsRule = options.filter(opt => opt.key === title)[0];

    deduplicationCursor.update('properties', (props) => {
      props = (!props) ? [] : props.toJS();
      let rule = props.filter(p => (p.key === id && (p.rule = optionsRule.key)))[0];

      if (!rule) {
        rule = {
          key: id,
          rule: optionsRule.key,
        };
        props.push(rule);
      }

      props = props.filter(opt => opt.rule !== '' || !!opt.attribute_version);
      this.setState({ rule });
      return Cursor.from(Immutable.fromJS(props));
    });
  }

  // Параметры конкретного свойства
  onChangeParams(data, cleanData, isValid = true) {
    this.props.onDisabledChange(!isValid);
    // const { properties } = this.props;
    const { deduplicationCursor } = this.props;
    const { id } = this.state;

    deduplicationCursor.update('properties', (props) => {
      props = (!props) ? [] : props.toJS();
      const rule = props.find(p => p.key === id);
      if (rule) rule.attribute_parameters = data;
      return Cursor.from(Immutable.fromJS(props));
    });
  }

  // attribute from group params
  onChangeParamsAttribute(data, cleanData, isValid = true) {
    this.props.onDisabledChange(!isValid);
    const { id } = this.state;
    const { deduplicationCursor } = this.props;

    deduplicationCursor.update('properties', (props) => {
      props = (!props) ? [] : props.toJS();

      let rule = props.find(p => p.key === id);
      if (rule) {
        rule.attribute_version = data;
      } else {
        rule = {
          key: id,
          attribute_version: data,
        };
        props.push(rule);
      }
      return Cursor.from(Immutable.fromJS(props));
    });
  }

  showRule(uuid, rule, id) {
    const { deduplicationCursor, properties, types, prop } = this.props;
    const type = types.find(type => type.get('uuid') === prop.getIn(['typeConfig', 'type']));
    if (!rule) {
      const values = properties.isEmpty() ? [] : properties.toJSON();
      values.push({ key: id });
      deduplicationCursor.set('properties', Cursor.from(Immutable.fromJS(values)));
    }

    this.props.showRule(uuid, id, properties, type);
  }

  render() {
    const { prop, type, group_rule, properties, deduplicationCursor } = this.props;
    const { rules, id } = this.state;
    const prop_type = prop.get('type');
    const options = rules[prop_type];

    let rule = Object.assign({}, noRule);
    let data_rule = {};

    const _rule = properties.find(r => r.get('key') === id);
    if (_rule) {
      data_rule = _rule.toJS();
      if (options) {
        rule = options.find(o => o.key === _rule.get('rule')) || Object.assign({}, noRule);
      }
    }

    if (!options) {
      if (prop_type === 'complex' || prop_type === 'list') {
        const uuid = prop.getIn(['typeConfig', 'type']);
        return (
          <tr>
            <td title={prop.getIn(['title', 'value'])}>{prop.getIn(['title', 'value'])}</td>
            <td><AuiButton onClick={() => this.showRule(uuid, _rule, id)}>Новая запись</AuiButton></td>
            <td />
            {group_rule ?
              <td>
                <DeduplicationParams
                  array_attribute_parameters={group_rule.parametri_atributov}
                  data={data_rule.attribute_version}
                  onChange={this.onChangeParamsAttribute}
                />
              </td> : <td />}
          </tr>
        );
      }
      return <tr />;
    }

    const functionsOptions = options.map((opt, index) => (
      <option key={index} value={opt.key}>
        {opt.title}
      </option>
      ));

    return (
      <tr>
        <td title={prop.getIn(['title', 'value'])}>{prop.getIn(['title', 'value'])}</td>
        <td>
          <select className="form-control" value={rule.key} onChange={this.onChangeSelect}>
            {functionsOptions}
          </select>
        </td>

        <td>
          <DeduplicationParams
            array_attribute_parameters={rule.array_attribute_parameters}
            data={data_rule.attribute_parameters}
            onChange={this.onChangeParams}
          />
        </td>

        {group_rule ?
          <td>
            <DeduplicationParams
              array_attribute_parameters={group_rule.parametri_atributov}
              data={data_rule.attribute_version}
              onChange={this.onChangeParamsAttribute}
            />
          </td> :
          <td />
        }

      </tr>
    );
  }

}
