import React, { PropTypes } from 'react';

import ButtonLink from '@gostgroup/gp-ui-components/lib/ButtonLink';
import { autobind } from 'core-decorators';
import Panel from '../ui/panel';
import Select from '../select';
import ReferenceEditor from '../editors/ReferenceEditor';
import { referencePositionTypes } from './tablePositionTypes';

@autobind
export default class TableReferenceSelector extends React.Component {
  static propTypes = {
    value: PropTypes.shape({}),
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  }

  onPositionTypeChange(position) {
    const config = this.props.value;
    this.props.onChange(config.set('positionType', position));
  }

  render() {
    const config = this.props.value;
    const deleteButton = (
      <ButtonLink title="Удалить справочник" onClick={this.props.onDelete}>
        <i className="glyphicon glyphicon-remove" />
      </ButtonLink>
    );
    return (
      <Panel tools={deleteButton}>
        <ReferenceEditor
          value={config}
          onChange={this.props.onChange}
        />
        <Select
          value={config.get('positionType')}
          label="Расположение"
          options={referencePositionTypes}
          onChange={this.onPositionTypeChange}
        />
      </Panel>
    );
  }
}
