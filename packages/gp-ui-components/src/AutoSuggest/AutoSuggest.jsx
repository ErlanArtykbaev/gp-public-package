import React, { PropTypes } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import { debounce } from 'core-decorators';
import styles from './autoSuggest.scss';

function getSuggestionValue(suggestion) {
  return suggestion.value;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.label}</span>
  );
}

function getString(value) {
  if (typeof value === 'undefined' || value === null) return '';
  return String(value);
}

export default class AutoSuggest extends React.Component {

  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    // onChange: PropTypes.func.isRequired,
    formatQuery: PropTypes.func,
    onValueChange: PropTypes.func,
    suggestionsMapper: PropTypes.func,
    getSuggestions: PropTypes.func,
    value: PropTypes.string,
    readOnly: PropTypes.bool,
    style: PropTypes.shape({}),
  }

  static defaultProps = {
    onSelect: () => {},
    onChange: () => {},
    formatQuery: query => query,
  }

  state = {
    value: '',
    suggestions: [],
    isLoading: false,
  }

  componentWillMount() {
    const { value } = this.props;
    this.setState({ value: getString(value) });
  }

  componentWillReceiveProps(props) {
    const currentValue = this.props.value;
    const newValue = props.value;

    if (currentValue !== newValue) {
      this.setState({ value: getString(newValue) });
    }
  }

  onSuggestionsFetchRequested = ({ value }) => {
    if (value !== this.state.value) {
      this.loadSuggestions(this.props.formatQuery(value));
    }
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  }

  onSuggestionSelected = (event, { suggestion }) => {
    if (this.props.type === 'house') {
      const arrVal = suggestion.value.split(' ');
      const house = `${arrVal[0]} ${arrVal[1]}`;
      suggestion.value = house;
      suggestion.label = house;
    }
    this.props.onSelect(suggestion);
  }

  onChange = (event, data) => {
    const isExternalValueChanger = typeof this.props.onValueChange === 'function';
    let { newValue } = data;
    // TODO откуда это?
    if (this.props.type === 'house' && data.method === 'click') {
      const arrVal = newValue.split(' ');
      const house = `${arrVal[0]} ${arrVal[1]}`;
      newValue = house;
    }

    if (isExternalValueChanger) {
      this.props.onValueChange(newValue);
      return;
    }

    this.setState({
      value: newValue,
    });
  }

  @debounce(500)
  loadSuggestions(value) {
    const { suggestionsMapper, getSuggestions } = this.props;

    this.setState({ isLoading: true });
    getSuggestions(value)
    .then(({ suggestions }) => {
      const mapped = suggestions.map(suggestionsMapper);
      this.setState({ suggestions: mapped, isLoading: false });
    });
  }

  render() {
    const { suggestions, isLoading, value } = this.state;
    const isExternalValueChanger = typeof this.props.onValueChange === 'function';

    const inputProps = {
      placeholder: '',
      value: isExternalValueChanger
        ? this.props.value || ''
        : value,
      onChange: this.onChange,
      style: this.props.style,
      disabled: this.props.readOnly,
    };

    return (
      <div className={styles['container-full']}>
        <ReactAutosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
        {isLoading && <span className={styles.preloader} />}
      </div>
    );
  }
}
