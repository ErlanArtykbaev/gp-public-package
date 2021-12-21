import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { autobind } from 'core-decorators';
import { ItemsService, ElementService } from '@gostgroup/gp-api-services/lib/services';

import Select from '../ui/select';
import Input from '../ui/Input';
import { RELATIONS_PATH_PREFIX } from '../relations-editor';

const baseSelectProps = {
  placeholder: 'Выберите',
  noResultsText: 'Ничего не найдено',
  searchPromptText: 'Введите строку для поиска',
  searchingText: 'Поиск',
  clearValueText: 'Очистить',
};

const InformationPanel = () => (
  <p style={{ color: '#7f8c8d' }}>
    Введите формулу для фильтрации.<br />
    Формула имеет следующий синтаксис:<br />
    <strong>ref.property === data.property</strong><br />
    где:<br />
    <strong>ref</strong> — ссылка на внешний справочник, используемый для фильтрации <br />
    <strong>data</strong> — текущий справочник <br />
    <strong>property</strong> — название свойства справочника <br />
    Пример формулы для фильтрации: <br />
    <strong> ref.strana === data.strana </strong>
  </p>
);

@autobind
export default class ReferenceEditor extends React.Component {

  static contextTypes = {
    container: PropTypes.object.isRequired,
  }

  static propTypes = {
    value: PropTypes.shape({
      get: PropTypes.func,
    }),
    onChange: PropTypes.func,
    disabled: PropTypes.bool, // проверить почему отдельный проп
    label: PropTypes.string,
  }

  static defaultProps = {
    label: 'Ключ справочника',
  }

  constructor(props) {
    super(props);
    const config = props.value;

    this.state = {
      filterInputEnabled: !!config.get('filter'),
      references: [],
      isLoading: false,
      refElement: null,
    };
  }

  componentDidMount() {
    const { value } = this.props;
    const key = value.get('key');
    const useDefaultValue = value.get('useDefaultValue');
    if (key) {
      this.loadRefElement(key);
    }
    if (useDefaultValue) {
      this.loadReferences();
    }
  }

  componentWillReceiveProps(props) {
    if (this.props.value.get('key') !== props.value.get('key')) {
      this.loadRefElement(props.value.get('key'));
    }
  }

  onIsHierarchicalChange(v) {
    let config = this.props.value;

    if (v) {
      config = config.set('key', undefined);
    }
    this.props.onChange(config.set('isHierarchical', v)
                              .set('filter', undefined));
  }

  onUseDefaultValueChange(v) {
    const config = this.props.value;
    if (v) {
      this.loadReferences();
    }
    this.props.onChange(config.set('useDefaultValue', v));
  }

  onKeyChange(v) {
    const config = this.props.value;
    const useDefaultValue = config.get('useDefaultValue');

    if (useDefaultValue) {
      this.loadReferences(v);
    }

    this.props.onChange(config.set('key', v).set('defaultValue', undefined));
  }

  onEmbedIdsChange(v) {
    const config = this.props.value;
    const arr = Immutable.fromJS([].concat(v || []));
    this.props.onChange(config.set('embedIds', arr));
  }

  onChange(key, v) {
    const config = this.props.value;
    this.props.onChange(config.set(key, v));
  }

  onFilterChange(event) {
    const config = this.props.value;
    this.props.onChange(config.set('filter', event.target.value));
  }

  loadRefElement(key) {
    ElementService.path(key).get().then((refElement) => {
      this.setState({ refElement });
    });
  }

  loadReferences(key = this.props.value.get('key')) {
    this.setState({ isLoading: true });
    ItemsService.path(key).get()
      .then(({ items }) => this.setState({ references: items, isLoading: false }));
  }

  enableFilterInput() {
    this.setState({ filterInputEnabled: true });
  }

  disableFilterInput() {
    const config = this.props.value;
    this.props.onChange(config.delete('filter'));
    this.setState({ filterInputEnabled: false });
  }

  render() {
    const { refElement } = this.state;
    const config = this.props.value;
    const value = config.get('key');
    const isHierarchical = config.get('isHierarchical');
    const isEmbedded = config.get('isEmbedded');
    const useDefaultValue = config.get('useDefaultValue');
    const defaultValue = config.get('defaultValue');
    const { refs } = this.context.container;
    const { references } = this.state;
    const defaultValueOptions = references.map(r => ({ value: r.id, label: r.title }));

    const embedIdOptions = [];
    if (refElement) {
      const ids = refElement.schema.config.properties.map(p => ({ value: p.id, label: p.title }));
      embedIdOptions.push(...ids);
    }
    const embedIds = config.get('embedIds') ? config.get('embedIds').toJS() : [];

    const options = refs.toJS()
      .filter(({ id, type }) => type === 'element' && (id.substr(0, RELATIONS_PATH_PREFIX.length) !== RELATIONS_PATH_PREFIX))
      .map(({ id, title }) => ({ value: id, label: title }));

    return (
      <div className="ref-editor">

        <Input
          type="bool"
          value={isHierarchical}
          label="Иерархический"
          onChange={this.onIsHierarchicalChange}
          disabled={this.props.disabled}
        />

        {!isHierarchical
          ?
            <div>
              <label className="control-label">{this.props.label}</label>
              <Select
                value={value}
                options={options}
                onChange={v => this.onKeyChange(v)}
                disabled={this.props.disabled}
                placeholder={'Выберите справочник'}
              />
            </div>
        : ''}

        {value &&
          <div>
            <Input
              type="bool"
              value={useDefaultValue}
              label="Использовать значение по умолчанию"
              onChange={v => this.onUseDefaultValueChange(v)}
              disabled={this.props.disabled}
            />
            {useDefaultValue &&
              <Select
                value={defaultValue}
                options={defaultValueOptions}
                onChange={v => this.onChange('defaultValue', v)}
                {...baseSelectProps}
                placeholder="Значение"
                isLoading={this.state.isLoading}
              />
            }
          </div>
        }

        <Input
          type="bool"
          value={isEmbedded}
          label="Отображать значение записи"
          onChange={v => this.onChange('isEmbedded', v)}
          disabled={this.props.disabled}
        />

        {isEmbedded && (
          <Select
            multi
            value={embedIds}
            options={embedIdOptions}
            label="Отображать только выбранные поля"
            onChange={this.onEmbedIdsChange}
          />
        )}

        {this.state.filterInputEnabled && !isHierarchical &&
          <div style={{ marginTop: 20 }}>
            <InformationPanel />
            <textarea
              className="form-control"
              value={config.get('filter')}
              onChange={this.onFilterChange}
            />
            <button
              type="button"
              className="btn btn-default btn-sm"
              style={{ marginTop: '10px' }}
              onClick={this.disableFilterInput}
            >
             Убрать фильтр
           </button>
          </div>
        }
        {!this.state.filterInputEnabled && !isHierarchical &&
          <button
            style={{ marginTop: 20 }}
            type="button"
            className="btn btn-default btn-sm"
            onClick={this.enableFilterInput}
          >
            Добавить фильтр
          </button>
        }
      </div>
    );
  }
}
