import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { autobind } from 'core-decorators';
import Select from '../ui/select';

@autobind
export default class ComplexEditor extends React.Component {

  componentDidMount() {
    const initialType = this.props.value.get('type');
    const error = typeof initialType === 'undefined' ? 'Выберите тип' : null;

    if (error) {
      this.setValidationResults(false);
    }
  }

  componentWillUnmount() {
    this.setValidationResults(true);
  }

  onTypeChange(v) {
    const { onChange } = this.props;
    this.setValidationResults(true);
    onChange(this.props.value.set('type', v || undefined));
  }

  setValidationResults(v) {
    const { setValidationResults, isValid } = this.props;
    if (setValidationResults && !!v !== !!isValid) {
      setValidationResults(this.props.property.get('uuid'), v);
    }
  }

  getContainer() {
    return this.context.container;
  }

  render() {
    const config = this.props.value;
    const { store } = this.getContainer();
    const initialType = config.get('type');
    const error = typeof initialType === 'undefined' ? 'Выберите тип' : null;

    let types = store.getData()
                     .getIn(['typeList', 'types'])
                     .filter(type => type.get('main') !== true && this.props.nameType !== type.getIn(['title', 'value']))
                     .map(type => new Immutable.Map({ id: type.get('uuid'), title: type.getIn(['title', 'value']) }));

    const emptyType = Immutable.fromJS([{ id: 0 }]);
    const disabled = Immutable.fromJS([{ id: 'disabled', title: 'Локальные типы данных:', disabled: true }]);
    const disabledGlobal = Immutable.fromJS([{ id: 'disabledGlobal', title: 'Глобальные типы данных:', disabled: true }]);

    let globalTypes = store.getData()
        .getIn(['typeList', 'global'])
        .filter(type => this.props.nameType !== type.getIn(['title', 'value']))
        .map(type => new Immutable.Map({ id: type.get('uuid'), title: type.getIn(['title', 'value']) }));

    if (types.size > 0) {
      types = disabled.concat(types);
    }
    if (globalTypes.size > 0) {
      globalTypes = disabledGlobal.concat(globalTypes);
    }
    if (error) {
      types = types.unshift(emptyType);
    }

    const allTypes = types.concat(globalTypes);

    return (
      <div>
        <Select
          label="Тип"
          options={allTypes.filter(t => t.get('id')).map(t => ({ value: t.get('id'), label: t.get('title'), disabled: t.get('disabled') })).toJS()}
          value={initialType}
          onChange={this.onTypeChange}
          disabled={this.props.disabled}
          error={error}
        />
      </div>
    );
  }
}

ComplexEditor.contextTypes = {
  container: PropTypes.shape({}).isRequired,
};

ComplexEditor.propTypes = {
  disabled: PropTypes.bool,
  isValid: PropTypes.bool,
  nameType: PropTypes.string,
  value: PropTypes.shape({
    get: PropTypes.func.isRequired,
    set: PropTypes.func.isRequired,
  }),
  onChange: PropTypes.func.isRequired,
  setValidationResults: PropTypes.func,
  property: PropTypes.shape({
    get: PropTypes.func,
  }),
};
