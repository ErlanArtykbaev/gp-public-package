import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import get from 'lodash/get';
// TODO передавать через props, что-то вроде getOptions
import { queryReferencesForEdit } from '@gostgroup/gp-api-services/lib/helpers/queryReferences';
import PropertySelector from './PropertySelector';
import SingleFilter from './SingleFilter';

export { PropertySelector };

@autobind
export default class PropertyFilter extends React.Component {

  static propTypes = {
    propertyFilters: PropTypes.array.isRequired,
    properties: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func.isRequired,
    onSet: PropTypes.func,
    element: PropTypes.shape({}),
  }

  static isValid = pf => typeof pf.key !== 'undefined' && typeof pf.value !== 'undefined' && pf.value && pf.value.length

  constructor(props) {
    super(props);

    this.state = {
      refValues: {},
    };
  }

  componentDidMount() {
    const { propertyFilters, element } = this.props;
    const { refValues } = this.state;
    this.loadRefs(element, refValues, propertyFilters);
  }

  componentWillReceiveProps(nextProps) {
    const { propertyFilters, element } = nextProps;
    const { refValues } = this.state;
    this.loadRefs(element, refValues, propertyFilters);
  }

  onPropertyFilterChange(index, value) {
    this.props.onChange(
      this.props.propertyFilters.map((f, i) => i === index ? value : f)
    );
  }

  addPropertyFilter() {
    const { propertyFilters, properties } = this.props;
    if (propertyFilters.length >= properties.length) return;
    this.props.onChange(propertyFilters.concat({ type: 'equals', value: '' }));
  }

  removePropertyFilter(index) {
    this.props.onChange(this.props.propertyFilters.filter((p, i) => i !== index));
  }

  loadRefs(element, refValues, propertyFilters) {
    // FIXME
    // как обычно, работает только для ОДНОГО ссылочного поля
    // 2 фильтра со ссылкоф настроить не выйдет
    const absolutPath = element.element.absolutPath;
    propertyFilters.forEach((filter) => {
      const prop = get(element, 'element.schema.config.properties', []).find(p => p.id === filter.key);
      const key = get(prop, 'config.key');
      if (!key || !filter.value) return;
      // fullPath, currentPath, startDate, endDate, term, entryId = '', page, perPage
      queryReferencesForEdit(key, absolutPath, '', '', '', filter.value).then((ref) => {
        refValues[filter.key] = ref[0] ? ref[0].title : '';
        this.setState({ refValues });
      });
    });
  }

  render() {
    const { propertyFilters, properties, element } = this.props;

    return (
      <div>
        <div>
          <button
            type="button"
            disabled={propertyFilters.length >= properties.length}
            className="aui-button inline-block"
            onClick={this.addPropertyFilter}
          >Добавить фильтр</button>

          {propertyFilters.length > 0 && (<button
            type="button"
            className="aui-button"
            onClick={() => this.props.onSet()}
          >
            Применить фильтры
          </button>)}
        </div>

        {propertyFilters.map((filter, index) => (<SingleFilter
          key={index}
          filter={filter}
          element={element}
          properties={properties}
          refValues={this.state.refValues}
          onChange={value => this.onPropertyFilterChange(index, value)}
          onRemove={() => this.removePropertyFilter(index)}
        />))}
      </div>
    );
  }

}

export const getFilterParam = propertyFilters => ({
  object: propertyFilters.reduce((obj, filter) => {
    if (!filter.type || filter.key === undefined) return obj;
    obj[filter.key] = filter.type === 'equals'
      ? filter.value
      : { [`$${filter.type}`]: filter.value };
    return obj;
  }, {}),
});
