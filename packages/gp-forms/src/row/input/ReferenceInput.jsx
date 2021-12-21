import React from 'react';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import Select from 'react-select';
import { autobind, debounce } from 'core-decorators';
import { applyFilterToReference } from '../../helpers/util.js';

const defaultSelectProps = {
  placeholder: '',
  noResultsText: 'Ничего не найдено',
  searchPromptText: 'Введите строку для поиска',
  searchingText: 'Поиск',
  clearValueText: 'Очистить',
};

const cache = {};
const hasher = (...args) => JSON.stringify(args);

@autobind
export default class ReferenceInput extends React.Component {

  static propTypes = {
    data: React.PropTypes.any,
    hardSelectOptions: React.PropTypes.arrayOf(React.PropTypes.shape({})),
    onDataChange: React.PropTypes.func.isRequired,
    config: React.PropTypes.object.isRequired,
    references: React.PropTypes.shape({}),
    preventLoading: React.PropTypes.bool,
    noAsyncSearch: React.PropTypes.bool,
    getFullData: React.PropTypes.func.isRequired,
    elementPath: React.PropTypes.string.isRequired,
    queryReferencesForEdit: React.PropTypes.func,
    queryReferencesForView: React.PropTypes.func,
    readOnly: React.PropTypes.bool,
    setAsyncLoadedReferences: React.PropTypes.func,
    ReferenceLink: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      // сюда помещаются последние найденные результаты
      reference: [],
      references: [],
      options: [],
      referenceData: null,
      isLoading: false,
    };
  }

  componentDidMount() {
    const { readOnly } = this.props;
    if (readOnly) {
      this.loadReferenceData();
    } else {
      this.getOptions();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.readOnly === this.props.readOnly) {
      return;
    }
    const { readOnly } = nextProps;
    if (readOnly) {
      this.loadReferenceData();
    } else {
      this.getOptions();
    }
  }

  @debounce(500)
  getOptions(term = '') {
    const { config, data = '', getFullData, elementPath, setAsyncLoadedReferences } = this.props;
    const key = config.config.key;
    const absolutPath = elementPath;

    const value = typeof term === 'string' && !!term.trim() ? term.trim() : data;

    const entryId = !isNaN(data) ? data : '';
    this.setState({ isLoading: true });
    return this.props.queryReferencesForEdit(key, absolutPath, value, entryId)
      .then((referenceData) => {
        setAsyncLoadedReferences(key, referenceData, entryId);
        const filteredReferenceData = applyFilterToReference(referenceData, getFullData(), config.config.filter);
        const options = filteredReferenceData.map(({ id, title }) => ({ value: id, label: title }));
        const optionsIndex = keyBy(options, 'value');
        this.setState({ options, optionsIndex, isLoading: false });
        return { options };
      });
  }

  // Only for readOnly
  loadReferenceData() {
    const { config, data = '', elementPath, queryReferencesForView } = this.props;
    const key = config.config.key;
    const absolutPath = elementPath;
    const hash = hasher(key, absolutPath, data);

    if (cache[hash]) {
      this.setState({ referenceData: cache[hash] });
    } else {
      queryReferencesForView(key, absolutPath, undefined, data).then((referenceData) => {
        this.setState({ referenceData });
        cache[hash] = referenceData;
      });
    }
  }

  handleChange(value) {
    const { optionsIndex } = this.state;
    const option = optionsIndex[value];
    const label = get(option, 'label', '');
    this.setState({ inputValue: label });
    if (this.props.onDataChange) {
      let parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        parsedValue = '';
        this.getOptions();
      }
      this.props.onDataChange(parsedValue, label);
    }
  }

  handleInputChange(value) {
    const { onDataChange, preventLoading } = this.props;
    this.setState({ inputValue: value });
    if (!preventLoading) {
      this.getOptions(value);
      onDataChange(null);
    } else {
      onDataChange('');
    }
  }

  render() {
    const { config, data = '', references = {}, noAsyncSearch, readOnly, ReferenceLink, hardSelectOptions } = this.props;
    const key = config.config.key;
    const reference = references[key] || this.state.referenceData;
    const possibleValues = get(config, 'config.possibleValues');

    if (readOnly) {
      if (!reference) {
        return (
          <div style={{ position: 'relative' }}>
            <input className="text input--readonly" disabled />
            <span className="aui-icon aui-icon-wait" style={{ position: 'absolute', left: '5px', top: '6px' }} />
          </div>
        );
      }
      const ref = reference.find(row => `${row.id}` === `${data}`) || {};
      return <div style={{ marginTop: '5px' }}><ReferenceLink referenceKey={key} id={ref.id} title={ref.title} versionId={ref.versionId || 1} /></div>;
    }

    if (noAsyncSearch) {
      return (
        <Select
          className="Ref-Select"
          options={hardSelectOptions || this.state.options}
          value={data == null ? '' : `${data}`}
          searchable={false}
          onChange={this.handleChange}
          {...defaultSelectProps}
        />
      );
    }
    const options = !possibleValues ? this.state.options : this.state.options.filter(option => possibleValues.includes(option.value));

    return (
      <Select
        className="Ref-Select"
        options={options}
        isLoading={this.state.isLoading}
        value={data}
        onChange={this.handleChange}
        onInputChange={this.handleInputChange}
        inputProps={{ value: this.state.inputValue, placeholder: '' }}
        blurResetsInput={false}
        {...defaultSelectProps}
      />
    );
  }
}
