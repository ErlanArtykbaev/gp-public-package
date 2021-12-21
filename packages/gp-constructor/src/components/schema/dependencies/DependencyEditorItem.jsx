import React, { PropTypes } from 'react';
import get from 'lodash/get';
import last from 'lodash/last';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Select from 'react-select';
import { TYPES, TYPES_LOCALE } from '@gostgroup/gp-nsi-utils/lib/schema/dependencies/types';
import { ValuesService, ItemsService } from '@gostgroup/gp-api-services/lib/services';
import ButtonLink from '@gostgroup/gp-ui-components/lib/ButtonLink';
import styles from './DependencyEditorItem.scss';

const baseSelectProps = {
  placeholder: 'Выберите свойство',
  noResultsText: 'Ничего не найдено',
  searchPromptText: 'Введите строку для поиска',
  searchingText: 'Поиск',
  clearValueText: 'Очистить',
};

function filterCondition(type) {
  return (condition) => {
    if (!condition.types || !type) return true;
    return (condition.types || []).includes(type);
  };
}

@autobind
export default class DependencyEditorItem extends React.Component {

  static propTypes = {
    onChange: PropTypes.func,
    rule: PropTypes.shape({}),
    onSelect: PropTypes.func,
    selected: PropTypes.string,
    conditions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
      auto: PropTypes.bool,
    })),
    autoConditions: PropTypes.arrayOf(PropTypes.string),
    properties: PropTypes.arrayOf(PropTypes.shape({})),
  }

  state = {
    isCollapsed: false,
    referenceValues: [],
    references: [],
  }

  componentDidMount() {
    const { properties, rule } = this.props;
    const value = rule.getIn(['value', 'field']);
    if (value) {
      const property = (properties || []).find(p => p.value === value) || {};
      if (property.reference) {
        ValuesService.path(property.reference).get({ key: last(value.split('.')) })
          .then(referenceValues => this.setState({ referenceValues }));
      }
      if (property.rootReference) {
        ItemsService.path(property.rootReference).get()
          .then(({ items }) => this.setState({ references: items }));
      }
    }
  }

  onChange(field, value) {
    let { rule } = this.props;
    const { properties } = this.props;

    if (field === 'field') {
      rule = rule
        .setIn(['value', 'condition'], null)
        .setIn(['value', 'value'], '');
      const property = (properties || []).find(p => p.value === value) || {};
      rule = rule.setIn(['value', 'reference'], property.reference);
      rule = rule.setIn(['value', 'rootReference'], property.rootReference);
      if (property.reference) {
        ValuesService.path(property.reference).get({ key: last(value.split('.')) })
          .then(referenceValues => this.setState({ referenceValues }));
      }
      if (property.rootReference) {
        ItemsService.path(property.rootReference).get()
          .then(({ items }) => this.setState({ references: items }));
      }
    }
    this.props.onChange(rule.get('uuid'), rule.setIn(['value', field], value));
  }

  renderRule(simpleRule) {
    const { referenceValues, references } = this.state;
    const rule = simpleRule.get('value');
    const { conditions, autoConditions, onSelect, properties } = this.props;
    const property = (properties || []).find(p => p.value === rule.get('field')) || {};
    const type = get(property, 'data.type');
    const reference = rule.get('reference');
    const rootReference = rule.get('rootReference');
    // console.log(reference, rootReference, rule.get('field'));
    const isManual = rule.get('condition') && !autoConditions.includes(rule.get('condition'));
    return (
      <div className="dependency-item-row">
        {onSelect &&
          <div
            className={cx(styles.toggle, { [styles['toggle-on']]: this.props.selected === simpleRule.get('uuid') })}
            onClick={() => this.props.onSelect(simpleRule)}
          />
        }
        <Select
          value={rule.get('field')}
          options={properties}
          clearable={false}
          onChange={value => this.onChange('field', value)}
          {...baseSelectProps}
          placeholder="Поле"
        />
        <Select
          value={rule.get('condition')}
          options={conditions.filter(filterCondition(type))}
          clearable={false}
          onChange={value => this.onChange('condition', value)}
          {...baseSelectProps}
          placeholder="Условие"
        />
        {isManual &&
          <Select
            value={rule.get('type')}
            options={[{ value: 'value', 'label': 'Значение' }, { value: 'field', label: 'Поле' }]}
            clearable={false}
            onChange={value => this.onChange('type', value)}
            {...baseSelectProps}
          />
        }
        {
          rule.get('type') === 'value' &&
          isManual && (
            <input
              type="text"
              className="form-control value-input"
              value={rule.get('value')}
              onChange={e => this.onChange('value', e.target.value)}
              placeholder="Значение"
            />
          )
        }
        {
          rule.get('type') === 'field' &&
          !reference && !rootReference && isManual &&
            <Select
              value={rule.get('value')}
              options={this.props.properties}
              clearable={false}
              onChange={value => this.onChange('value', value)}
              {...baseSelectProps}
              placeholder="Поле"
            />
        }
        {
          rule.get('type') === 'field' &&
          reference && !rootReference && isManual &&
            <Select
              value={rule.get('value')}
              options={referenceValues.map(v => ({ value: v, label: v }))}
              clearable={false}
              onChange={value => this.onChange('value', value)}
              {...baseSelectProps}
              placeholder="Поле"
            />
        }
        { rule.get('type') === 'field' &&
          rootReference && isManual &&
            <Select
              value={rule.get('value')}
              options={references.map(v => ({ value: v.id, label: v.title }))}
              clearable={false}
              onChange={value => this.onChange('value', value)}
              {...baseSelectProps}
              placeholder="Поле"
            />
        }
      </div>
    );
  }

  render() {
    const { isCollapsed } = this.state;
    const { rule, onSelect } = this.props;
    if (!rule) return <div />;
    const collapsedIconClass = cx({ 'fa fa-angle-right': isCollapsed, 'fa fa-angle-down': !isCollapsed });
    const bodyClass = cx('panel-body', { collapse: isCollapsed });

    if (rule.get('type') === TYPES.SIMPLE) {
      return this.renderRule(rule);
    }

    return (
      <div className="panel panel-default" style={{ height: '100%' }} >
        <div className="panel-heading" style={{ height: '40px' }}>
          {onSelect &&
            <div
              className={cx(styles.toggle, { [styles['toggle-on']]: this.props.selected === rule.get('uuid') })}
              onClick={() => onSelect(rule)}
            />
          }
          <ButtonLink title={isCollapsed ? 'Развернуть' : 'Свернуть'} onClick={() => this.setState({ isCollapsed: !isCollapsed })}>
            <i className={collapsedIconClass}>&nbsp;</i>
          </ButtonLink>
          {TYPES_LOCALE[rule.get('type')]}
        </div>
        <div className={bodyClass}>
          {rule.get('children').map((r, i) => (
            <DependencyEditorItem
              key={i}
              rule={r}
              onChange={this.props.onChange}
              onSelect={this.props.onSelect}
              selected={this.props.selected}
              conditions={this.props.conditions}
              autoConditions={this.props.autoConditions}
              properties={this.props.properties}
            />
          ))}
        </div>
      </div>
    );
  }

}
