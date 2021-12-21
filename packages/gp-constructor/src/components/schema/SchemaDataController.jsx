import React, { PropTypes } from 'react';
import TypeListController from './TypeListController';
import GlobalTypeListController from './GlobalTypeListController';
import TypeEditorController from './TypeEditorController';
import DependencyListController from './dependencies/DependencyListController';
import DependencyEditorController from './dependencies/DependencyEditorController';

// Вкладка "Схема данных" при создании справочника
export default class SchemaDataController extends React.Component {

  static contextTypes = {
    container: PropTypes.shape({
      useGlobalTypes: PropTypes.bool,
      useDependencies: PropTypes.bool,
    }),
  }

  static propTypes = {
    cursor: PropTypes.func.isRequired,
    container: PropTypes.object.isRequired,
    main_data: PropTypes.shape({}),
  }

  render() {
    const { container } = this.context;
    const { useGlobalTypes, useDependencies } = container;
    return (
      <div>
        <div className="col-lg-3" style={{ padding: 0 }}>
          <TypeListController
            cursor={this.props.cursor}
            container={this.props.container}
            main_data={this.props.main_data}
          />
          {useGlobalTypes && (
            <GlobalTypeListController
              container={this.props.container}
              cursor={this.props.cursor}
            />
          )}
          {useDependencies && (
            <DependencyListController
              cursor={this.props.cursor}
              container={this.props.container}
              main_data={this.props.main_data}
            />
          )}
        </div>
        <div className="col-lg-9" style={{ paddingRight: 0 }}>
          <TypeEditorController
            container={this.props.container}
            cursor={this.props.cursor}
            {...this.props}
          />
          <DependencyEditorController
            container={this.props.container}
            cursor={this.props.cursor}
            {...this.props}
          />
        </div>
      </div>
    );
  }

}
