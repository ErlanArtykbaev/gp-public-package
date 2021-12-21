import React from 'react';
import { autobind } from 'core-decorators';

import { connect } from 'react-redux';

import keys from 'lodash/keys';
import filter from 'lodash/filter';
import DeduplicationTypes from './DeduplicationTypes';
import DeduplicationRuleModal from './DeduplicationRuleModal';
import Input from '../ui/Input';
import { validateNumber } from '../../utils/validators.js';

// Вкладка дедупликация
@connect(
  state => state.core.deduplication,
  null, null, { pure: false }
)
@autobind
export default class DeduplicationDataController extends React.Component {

  static propTypes = {
    checkValidate: React.PropTypes.func.isRequired, // функция которая будет передавать в компонент выше валидность введенных данных дедупликации
    cursor: React.PropTypes.func.isRequired, // курсор по данным в Store редактора

    types: React.PropTypes.shape({}).isRequired, // из DeduplicationRulesStore, типы данных в дедупликации
    rules: React.PropTypes.shape({}).isRequired, // из DeduplicationRulesStore, правила дедупликации
    gruppovie_pravila: React.PropTypes.array.isRequired, // из DeduplicationRulesStore, групповые правила с указанием типа данных атрибутов правила, ключа, названия
  }

  constructor(props) {
    super(props);

    const types = props.cursor(['typeList']).get('types');
    const main_type = types.find(t => t.get('main'));

    this.state = {
      main_type,
      types,
      child_rule_params: null,
      thresholdErrors: {},
    };
  }

  componentDidMount() {
    this.checkErrors();
  }

  onDisabledChange(disabled) {
    this.setState({ formError: disabled }, () => this.validate());
  }

  // пороги по типу
  onChangeThreshold = type => (value) => {
    const { thresholdErrors } = this.state;
    const error = validateNumber(value);
    thresholdErrors[type] = error;
    const deduplicationCursor = this.props.cursor(['deduplicationRules']);
    deduplicationCursor.update(type, () => value);

    this.setState({ thresholdErrors }, () => this.validate());
  }

  // показывает модальное окно редактирования дедупликации составного типа
  showRule(id, key, path, type) {
    const child_rule_params = { id, key, path, type };
    this.setState({ child_rule_params });
  }

  // вызывается при маунте чтобы понять какие поля заполнены неверно
  checkErrors() {
    const { thresholdErrors } = this.state;
    const deduplicationRules = this.props.cursor(['deduplicationRules']).toJS();
    thresholdErrors.yellow = validateNumber(deduplicationRules.yellow);
    thresholdErrors.red = validateNumber(deduplicationRules.red);

    this.setState({ thresholdErrors }, () => this.validate());
  }

  // смотрит на наличие неправильно заполненных полей дедупликации
  // и отправляет валидность дедупликации выше
  validate() {
    const { thresholdErrors, formError } = this.state;
    const valid = !(!!filter(thresholdErrors).length || formError);
    this.props.checkValidate('deduplication_data', valid);
  }

  render() {
    const { cursor, rules, types, gruppovie_pravila } = this.props;
    const deduplicationCursor = cursor(['deduplicationRules']);
    const deduplicationProperties = this.state.main_type.get('properties')
          .filter(p => [...keys(rules), ...['complex', 'list']].includes(p.get('type')));
    const deduplication = {
      rules,
      types,
      gruppovie_pravila,
      deduplicationProperties, // свойства выбранного типа данных, которые будут использоваться
    };

    return (
      <div>
        <DeduplicationTypes
          showRule={this.showRule}
          type={this.state.main_type}
          types={this.state.types}
          deduplication={deduplication}
          deduplicationCursor={deduplicationCursor}
          onDisabledChange={this.onDisabledChange}
        />

        <div className="form-group col-lg-12">
          <Input
            value={deduplicationCursor.get('yellow')}
            onChange={this.onChangeThreshold('yellow')}
            label="Желтый порог"
            error={this.state.thresholdErrors.yellow}
          />
          <Input
            value={deduplicationCursor.get('red')}
            onChange={this.onChangeThreshold('red')}
            label="Красный порог"
            error={this.state.thresholdErrors.red}
          />
        </div>

        {!!this.state.child_rule_params &&
          <DeduplicationRuleModal
            child_rule_params={this.state.child_rule_params}
            onClose={() => this.setState({ child_rule_params: null })}
            types={this.state.types}
            parent_cursor={deduplicationCursor}
            deduplication={deduplication}
            rules={this.props.rules}
          />
        }
      </div>
    );
  }
}
