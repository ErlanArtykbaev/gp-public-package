import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';
import getReferences from '@gostgroup/gp-api-services/lib/helpers/element/getReferences';

const propertyTypes = {
  auto: {
    title: 'Авто',
  },
  number: {
    title: 'Число',
  },
  integer: {
    title: 'Целое',
  },
  date: {
    title: 'Дата',
  },
  string: {
    title: 'Строка',
  },
  bool: {
    title: 'Логический',
  },
  reference: {
    title: 'Справочник',
  },
  complex: {
    title: 'Составной',
  },
  list: {
    title: 'Список',
  },
  file: {
    title: 'Файл',
  },
  computable: {
    title: 'Вычислимый',
  },
  geojson: {
    title: 'Геоданные',
  },
};

@autobind
export default class ComputableEditor extends React.Component {

  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    properties: PropTypes.shape({}).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      references: [],
      hierarchicalReferences: [],
    };
  }

  async componentDidMount() {
    const currentReferences = filter(this.props.properties.toJS(), p => p.type === 'reference');
    const referencesArray = filter(currentReferences, r => r.typeConfig.key).map(r => r.typeConfig.key);
    const hierarchicalReferences = filter(currentReferences, r => r.typeConfig.isHierarchical && !r.typeConfig.key);
    this.setState({ hierarchicalReferences });
    const references = await getReferences(referencesArray);
    this.setState({ references });
  }

  async componentWillReceiveProps(props) {
    const currentReferences = filter(this.props.properties.toJS(), p => p.type === 'reference');
    const nextReferences = filter(props.properties.toJS(), p => p.type === 'reference');
    const hierarchicalReferences = filter(nextReferences, r => r.typeConfig.isHierarchical && !r.typeConfig.key);
    this.setState({ hierarchicalReferences });

    const currentReferencesArray = filter(currentReferences, r => r.typeConfig.key).map(r => r.typeConfig.key);
    const nextReferencesArray = filter(nextReferences, r => r.typeConfig.key).map(r => r.typeConfig.key);
    if (!isEqual(currentReferencesArray, nextReferencesArray)) {
      const references = await getReferences(nextReferencesArray);
      this.setState({ references });
    }
  }

  onChange(e) {
    this.props.onChange(this.props.value.set('type', e.target.value));
  }

  hasReference() {
    const properties = this.props.properties.toJS();
    for (let i = 0; i < properties.length; i++) {
      if (properties[i].type === 'reference') {
        if (!this.props.reference) {
          return <li>Загрузка...</li>;
        }
      }
    }
  }

  renderReferencedName(properties, key) {
    for (let i = 0; i < properties.length; i++) {
      if (properties[i].type === 'reference') {
        if (properties[i].typeConfig.key === key) {
          return <span>{properties[i].id.value}</span>;
        }
      }
    }
    return '';
  }

  renderReferencedProperties(reference) {
    let { properties } = reference.schema.config;
    // console.log(reference);
    properties = properties.map(this.renderRefProperty.bind(null, reference.absolutPath));
    return (
      <div key={reference.absolutPath}>
        <b>{reference.fullTitle}:</b>
        {properties}
      </div>
    );
  }

  renderHierarchicalProperties(properties, reference) {
    const jsProps = properties.map((data) => {
      if (data.type === 'string' || data.type === 'integer' || data.type === 'number' || data.type === 'computable') {
        return <li key={data.uuid}>ref.{reference.id.value}.{data.id.value} ({data.title.value}) - {propertyTypes[data.type].title}</li>;
      }
      return false;
    });

    return (
      <div>
        <b>Иерархический:</b>
        {jsProps}
      </div>
    );
  }

  renderProperties(data) {
    if (data.type === 'string' || data.type === 'integer' || data.type === 'number') {
      return (
        <li key={data.id.value}>data.{data.id.value} ({data.title.value}) - {propertyTypes[data.type].title}</li>
      );
    }
    return false;
  }

  renderRefProperty(key, data) {
    if (data.type === 'string' || data.type === 'integer' || data.type === 'number' || data.type === 'computable') {
      return <li key={data.id}>ref.{this.renderReferencedName(this.props.properties.toJS(), key)}.{data.id} ({data.title}) - {propertyTypes[data.type].title}</li>;
    }
    return false;
  }

  render() {
    const computableExpression = this.props.value.get('type') || '';

    return (
      <div>
        <label>Доступные переменные:</label>
        <ul>
          <b>Текущий справочник:</b>
          {this.props.properties.toJS().map(this.renderProperties)}
          {this.state.hierarchicalReferences ? this.state.hierarchicalReferences.map(this.renderHierarchicalProperties.bind(null, this.props.properties.toJS())) : false}
          {this.state.references ? this.state.references.map(this.renderReferencedProperties) : false}
        </ul>
        <br />
        <input className="form-control" type="text" name="input" value={computableExpression} onChange={this.onChange} />
      </div>
    );
  }
}
