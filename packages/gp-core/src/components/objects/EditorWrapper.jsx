import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import createElement from '@gostgroup/gp-models/lib/element';

import { connect } from 'react-redux';

import Editor from '@gostgroup/gp-constructor/lib/components/Editor';
import Store from '@gostgroup/gp-constructor/lib/Store.js';

// TODO добавить полное описание контекста в собственно Editor
// TODO FIXME добавить Path

@connect(
  state => state.core.session,
  null, null, { withRef: true },
)
@autobind
export default class EditorWrapper extends Component {

  static propTypes = {
    schema: PropTypes.object,
    element: PropTypes.object,
    globalTypes: PropTypes.arrayOf(PropTypes.shape({})),
    valid_data: PropTypes.object,
    processes: PropTypes.array,
    refs: PropTypes.object,
    onDisabledChange: PropTypes.func,
    onGlobalTypeSave: PropTypes.func,
    checkValidate: PropTypes.func,
    readOnly: PropTypes.bool,
    userPermissions: PropTypes.array,
    permissionGroups: PropTypes.array,
    useGlobalTypes: PropTypes.bool,
    useDependencies: PropTypes.bool,
    availableContexts: PropTypes.arrayOf(PropTypes.string),
    disabledTypes: PropTypes.arrayOf(PropTypes.string),
    path: PropTypes.arrayOf(PropTypes.shape({})),
    clearSchema: PropTypes.bool, // Если true то при создании схемы не будет никаких дефолтных свойств
    EditorComponent: PropTypes.func,
    defaultElement: PropTypes.func,
  }

  static childContextTypes = {
    container: PropTypes.object,
  }

  static defaultProps = {
    userPermissions: [],
    permissionGroups: [{
      id: 'administrators',
      title: 'Администраторы',
    }, {
      id: 'users',
      title: 'Пользователи',
    }],
    useGlobalTypes: true,
    useDependencies: true,
    availableContexts: Editor.DEFAULT_CONTEXTS,
    path: [],
  }

  constructor(props) {
    super(props);

    const store = new Store(this._onChange.bind(this));

    if (props.schema) {
      store.setSchema(props.schema);
    } else {
      store.setClearSchema(props.clearSchema);
    }

    if (props.globalTypes) {
      store.setGlobalTypes(props.globalTypes);
    } else {
      store.setClearGlobalTypes();
    }

    const { element, defaultElement } = props;
    const main_data = createElement(element || defaultElement);
    console.log(main_data);

    this.state = {
      store,
      main_data,
    };
  }

  getChildContext() {
    const container = {
      store: this.state.store,
      refs: this.props.refs,
      isMainImmutable: false,
      onChangeMainValue: this.onChangeMainValue.bind(this),
      main_data: this.state.main_data,
      isMutable: !this.props.schema,
      checkValidate: this.props.checkValidate,
      processes: this.props.processes,
      onDisabledChange: this.props.onDisabledChange,
      onGlobalTypeSave: this.props.onGlobalTypeSave,
      permissions: this.props.userPermissions,
      permissionGroups: this.props.permissionGroups,
      useGlobalTypes: this.props.useGlobalTypes,
      useDependencies: this.props.useDependencies,
      availableContexts: this.props.availableContexts,
      disabledTypes: this.props.disabledTypes,
      path: this.props.path,
    };

    return { container };
  }

  onChangeMainValue(key, value) {
    const { main_data } = this.state;
    main_data[key] = value;
    this.setState({ main_data });
  }

  getSchema(data) {
    return this.state.store.getSchema(data);
  }

  getClearSchema() {
    return this.state.store.getClearSchema();
  }

  getGlobalSchema() {
    return this.state.store.getGlobalSchema();
  }

  getMainData() {
    return this.state.main_data;
  }

  _onChange() {
    const { store } = this.state;
    this.setState({ store });
  }

  render() {
    const EditorComponent = this.props.EditorComponent || Editor;
    return (
      <EditorComponent
        isClear={!this.props.schema}
        onDisabledChange={this.props.onDisabledChange}
        readOnly={this.props.readOnly}
        main_data={this.state.main_data}
        valid_data={this.props.valid_data}
        editorAction={this.props.element ? 'EDIT' : 'CREATE'}
      />
    );
  }

}
