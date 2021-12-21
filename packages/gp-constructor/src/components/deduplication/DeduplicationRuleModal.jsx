import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Cursor from 'immutable/contrib/cursor';
import Immutable from 'immutable';
import keys from 'lodash/keys';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import DeduplicationTypes from './DeduplicationTypes';


// Полный аналог начального вида дедупликации, для редактирования сложных типов
@autobind
export default class DeduplicationRuleModal extends Component {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    types: React.PropTypes.shape({}).isRequired, // из DeduplicationRulesStore, типы данных в дедупликации
    rules: React.PropTypes.shape({}).isRequired, // из DeduplicationRulesStore, правила дедупликации
    deduplication: PropTypes.shape({}),
    parent_cursor: PropTypes.shape({}),
    child_rule_params: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    const { parent_cursor, child_rule_params: { key } } = props;
    const cursor = parent_cursor.get('properties').find(prop => prop.get('key') === key);
    const cursor_data = cursor.cursor('rule').toJSON();
    const rule_cursor = Cursor.from(Immutable.fromJS(cursor_data), this._onChange);

    this.state = {
      cursor,
      rule_cursor,
      child_rule_params: null,
    };
  }

  onDisabledChange() {
    // this.setState({formError: disabled}, () => this.validate());
  }

  onClose() {
    const { parent_cursor, child_rule_params: { key } } = this.props;

    // Заменил метод set, так как из за него зависает система при закрытии окна
    parent_cursor.update('properties', (props) => {
      props = props.toJSON();
      const prop = props.find(p => p.key === key);
      const rule = this.state.rule_cursor.toJSON();
      if (rule && (
          (!rule.properties || rule.properties.length === 0)
          && (!rule.gruppovie_pravila || rule.gruppovie_pravila.length === 0))) {
        prop.rule = undefined;
      } else {
        prop.rule = rule;
      }
      props = props.filter(opt => opt.rule);
      return Cursor.from(Immutable.fromJS(props));
    });
    this.props.onClose();
  }

  showRule(id, key, path, type) {
    const child_rule_params = { id, key, path, type };
    this.setState({ child_rule_params });
  }

  _onChange(nextState) {
    this.setState({ rule_cursor: Cursor.from(nextState, this._onChange) });
  }

  render() {
    const { child_rule_params, deduplication, rules } = this.props;
    const deduplicationProperties = child_rule_params.type.get('properties')
      .filter(p => [...keys(rules), ...['complex', 'list']].includes(p.get('type')));
    deduplication.deduplicationProperties = deduplicationProperties;

    return (
      <Modal
        title="Редактирование дедупликации"
        isOpen
        onClose={this.onClose}
      >
        <DeduplicationTypes
          showRule={this.showRule}
          onDisabledChange={this.onDisabledChange}
          type={child_rule_params.type}
          types={this.props.types}
          deduplication={deduplication}
          deduplicationCursor={this.state.rule_cursor}
        />

        {this.state.child_rule_params &&
          <DeduplicationRuleModal
            child_rule_params={this.state.child_rule_params}
            onClose={() => this.setState({ child_rule_params: null })}
            type={child_rule_params.type}
            types={this.props.types}
            parent_cursor={this.state.rule_cursor}
            deduplication={deduplication}
            rules={this.props.rules}
          />
        }
      </Modal>
    );
  }
}
