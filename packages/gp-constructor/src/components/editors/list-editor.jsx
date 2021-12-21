import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import Immutable from 'immutable';
import Select from '../ui/select';
import Input from '../ui/Input';

@autobind
export default class ListEditor extends Component {

  static contextTypes = {
    container: React.PropTypes.object.isRequired,
  }

  componentDidMount() {
    const initialType = this.props.value.get('type');
    const error = typeof initialType === 'undefined' ? 'Выберите тип' : null;

    if (error) {
      this.props.onDisabledChange(true);
    }
  }

  componentWillUnmount() {
    this.props.onDisabledChange(false);
  }

  onTypeChange(v) {
    this.props.onDisabledChange(false);
    this.props.onChange(this.props.value.set('type', v));
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
    const disabledGlobal = Immutable.fromJS([{ id: 'disabled-global', title: 'Глобальные типы данных:', disabled: true }]);

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

    const options = allTypes.filter(t => t.get('id')).map(t => ({ value: t.get('id'), label: t.get('title'), disabled: t.get('disabled') })).toJS();

    return (
      <div>
        <Select
          label="Тип"
          options={options}
          value={initialType}
          onChange={this.onTypeChange}
          disabled={this.props.disabled}
          error={error}
        />
      </div>
    );
  }

}
