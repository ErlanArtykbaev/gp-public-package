import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import ExportListController from './ExportListController';
import TypeEditorController from './ExportEditorController';

// Вкладка "Схема данных" при создании справочника
@autobind
export default class ExportController extends React.Component {

  static contextTypes = {
    container: PropTypes.shape({}),
  }

  static propTypes = {
    cursor: PropTypes.func.isRequired,
    container: PropTypes.object.isRequired,
    main_data: PropTypes.shape({}),
  }
  state = {
    selected: '',
  }

  onSelected(selectedId) {
    this.setState({ selected: selectedId });
  }

  render() {
    return (
      <div>
        <div className="col-lg-3" style={{ padding: 0 }}>
          <ExportListController
            cursor={this.props.cursor}
            container={this.props.container}
            main_data={this.props.main_data}
            onSelected={this.onSelected}
            selected={this.state.selected}
          />
        </div>
        <div className="col-lg-9" style={{ paddingRight: 0 }}>
          <TypeEditorController
            container={this.props.container}
            cursor={this.props.cursor}
            {...this.props}
            selected={this.state.selected}
          />
        </div>
      </div>
    );
  }
}
