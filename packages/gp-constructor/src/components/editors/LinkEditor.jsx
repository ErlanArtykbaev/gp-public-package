import React, { PropTypes } from 'react';
import get from 'lodash/get';
import { autobind } from 'core-decorators';
import Select from 'react-select';
import { ElementService } from '@gostgroup/gp-api-services/lib/services';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';
import { RELATIONS_PATH_PREFIX } from '../relations-editor';
import { PRIMITIVE_TYPES } from '../../types.js';
import styles from './baseEditor.scss';

// const InformationPanel = () => (
//   <p style={{ color: '#7f8c8d' }}>
//     Введите формулу для фильтрации.<br />
//     Формула имеет следующий синтаксис:<br />
//     <strong>ref.property === data.property</strong><br />
//     где:<br />
//     <strong>ref</strong> — ссылка на внешний справочник, используемый для фильтрации <br />
//     <strong>data</strong> — текущий справочник <br />
//     <strong>property</strong> — название свойства справочника <br />
//     Пример формулы для фильтрации: <br />
//     <strong> ref.strana === data.strana </strong>
//   </p>
// );

// TODO добавить валидацию на заполненность

@autobind
export default class LinkEditor extends React.Component {

  static contextTypes = {
    container: PropTypes.object.isRequired,
  }

  static propTypes = {
    value: PropTypes.shape({}),
    onChange: PropTypes.func,
    disabled: PropTypes.bool, // проверить почему отдельный проп
    label: PropTypes.string,
    properties: PropTypes.shape({}),
  }

  static defaultProps = {
    label: 'Ключ справочника',
  }

  constructor(props) {
    super(props);

    this.state = {
      schema: null,
      schemaIsLoaded: false,
    };
  }

  componentDidMount() {
    const config = this.props.value;
    const value = config.get('key');
    if (!isEmpty(value)) {
      this.loadReference(value);
    }
  }

  onKeyChange(v) {
    const config = this.props.value;
    this.props.onChange(config.set('key', v));
    if (isEmpty(v)) {
      this.clean();
    } else {
      this.loadReference(v);
    }
  }

  clean() {
    const config = this.props.value;
    this.props.onChange(config.delete('key').delete('ownProperty').delete('linkProperty'));
  }

  handleChange = field => (value) => {
    const config = this.props.value;
    this.props.onChange(config.set(field, value));
  }

  loadReference(v) {
    ElementService.path(v).get().then(({ schema }) => {
      this.setState({ schema });
    });
  }

  render() {
    const { schema } = this.state;
    const { properties } = this.props;
    const config = this.props.value;
    const value = config.get('key');
    const ownProperty = config.get('ownProperty');
    const linkProperty = config.get('linkProperty');
    const linkDisplayProperty = config.get('linkDisplayProperty');
    const { refs } = this.context.container;

    const options = refs.toJS()
      .filter(({ id }) => (id.substr(0, RELATIONS_PATH_PREFIX.length) !== RELATIONS_PATH_PREFIX))
      .map(({ id, title }) => ({ value: id, label: title }));
    const ownProperties = (properties.toJS() || [])
      .filter(({ type }) => PRIMITIVE_TYPES.includes(type))
      .map(({ id, title }) => ({ value: id.value, label: title.value }));
    const linkProperties = get(schema, 'config.properties', [])
      .filter(({ type }) => PRIMITIVE_TYPES.includes(type))
      .map(({ id, title }) => ({ value: id, label: title }));

    return (
      <div className="ref-editor">
        <div className={styles.configProperty}>
          <label className="control-label">{this.props.label}</label>
          <Select
            value={value}
            options={options}
            onChange={this.onKeyChange}
            disabled={this.props.disabled}
            placeholder={'Выберите справочник'}
          />
        </div>
        <div className={styles.configProperty}>
          <label className="control-label">Поле текущего справочника</label>
          <Select
            value={ownProperty}
            options={ownProperties}
            onChange={this.handleChange('ownProperty')}
            disabled={this.props.disabled}
            placeholder={'Выберите поле'}
          />
        </div>
        <div className={styles.configProperty}>
          <label className="control-label">Поле выбранного справочника</label>
          <Select
            value={linkProperty}
            options={linkProperties}
            onChange={this.handleChange('linkProperty')}
            disabled={this.props.disabled}
            placeholder={'Выберите поле'}
          />
        </div>
        <div className={styles.configProperty}>
          <label className="control-label">Поле выбранного справочника для отображения</label>
          <Select
            value={linkDisplayProperty}
            options={linkProperties}
            onChange={this.handleChange('linkDisplayProperty')}
            disabled={this.props.disabled}
            placeholder={'Выберите поле'}
          />
        </div>
      </div>
    );
  }
}
