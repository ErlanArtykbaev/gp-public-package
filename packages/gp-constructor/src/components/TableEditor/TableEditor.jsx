import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { autobind } from 'core-decorators';
import Panel from '../ui/panel';
import Select from '../select';

import ComplexEditor from '../editors/ComplexEditor';
import TableReferenceSelector from './TableReferenceSelector';
import { referencePositionTypes, tableTypePositionTypes } from './tablePositionTypes.js';

@autobind
export default class TableEditor extends React.Component {
  static propTypes = {
    value: PropTypes.shape({}),
    onChange: PropTypes.func,
  }

  componentWillMount() {
    const config = this.props.value;
    const defaultConfig = Immutable.fromJS({
      typePosition: tableTypePositionTypes.getIn([0, 'id']),
      crossReferences: [],
    });

    if (config.size === 0) {
      this.props.onChange(defaultConfig);
    }
  }

  onTypeChange(typeWrapped) {
    // fixme
    const type = typeWrapped.get('type');
    const config = this.props.value;
    this.props.onChange(config.set('type', type));
  }

  onReferenceChange(index, refConfig) {
    const config = this.props.value;
    this.props.onChange(config.setIn(['crossReferences', index], refConfig));
  }

  onTypePositionChange(position) {
    const config = this.props.value;
    this.props.onChange(config.set('typePosition', position));
  }

  addReference() {
    const config = this.props.value;

    this.props.onChange(config.update('crossReferences', crossReferences => (
      crossReferences.push(Immutable.fromJS({
        positionType: referencePositionTypes.getIn([0, 'id']),
      }))
    )));
  }

  deleteReference(index) {
    const config = this.props.value;
    this.props.onChange(config.deleteIn(['crossReferences', index], index));
  }

  render() {
    const config = this.props.value;

    if (config.size === 0) {
      // todo посмотреть как нормально сеттить дефолтные настройки конфигурации
      return null;
    }

    const crossReferences = config.get('crossReferences').map((reference, i) => (
      <TableReferenceSelector
        key={i} // ну а как ещё
        value={reference}
        onDelete={() => this.deleteReference(i)}
        onChange={this.onReferenceChange.bind(this, i)}
      />
    ));

    return (
      <div>
        <ComplexEditor
          value={config}
          label="Тип данных таблицы"
          onChange={this.onTypeChange}
        />

        <Select
          value={config.get('typePosition')}
          label="Расположение"
          options={tableTypePositionTypes}
          onChange={this.onTypePositionChange}
        />

        <Panel title="Справочники таблицы">
          {crossReferences}

          <button
            className="btn btn-default btn-sm"
            type="button"
            onClick={this.addReference}
          >
            Добавить справочник
          </button>
        </Panel>
      </div>
    );
  }
}
