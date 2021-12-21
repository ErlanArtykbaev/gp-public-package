import React, { PropTypes } from 'react';
import CSSTransitionGroup from 'react-addons-transition-group';
import cx from 'classnames';
import Immutable from 'immutable';
import MainDataController from './main_data/MainDataController';
import SchemaDataController from './schema/SchemaDataController';
import RelationsDataController from './relations/RelationsDataController';
import DeduplicationDataController from './deduplication/DeduplicationDataController';
import ExportController from './export/ExportController';

const CONTEXT_ITEMS = [
  {
    title: 'Главная',
    contextKey: 'mainContext',
  },
  {
    title: 'Схема данных',
    contextKey: 'schemaDataContext',
  },
  {
    title: 'Дедупликация',
    contextKey: 'deduplicationContext',
  },
  {
    title: 'Связи',
    contextKey: 'relationsContext',
  },
  {
    title: 'Настройка шаблонов экспорта',
    contextKey: 'exportContext',
  },
];

function ContextItem({ error, onClick, selected, title }) {
  const className = cx({ 'aui-nav-selected': selected, 'text-color-error': error });
  return (
    <li className={className}>
      <a onClick={onClick}>{title}</a>
    </li>
  );
}

ContextItem.propTypes = {
  error: PropTypes.bool,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  title: PropTypes.string,
};

function ContextItemsList({ availableContexts, onChange, errors, selected }) {
  const items = CONTEXT_ITEMS.filter(i => availableContexts.includes(i.contextKey));
  return (
    <ul className="aui-nav">
      {items.map(i =>
        <ContextItem
          key={i.contextKey}
          selected={selected === i.contextKey}
          error={errors[i.contextKey]}
          title={i.title}
          onClick={onChange.bind(null, i.contextKey)}
        />
      )}
    </ul>
  );
}

ContextItemsList.propTypes = {
  availableContexts: PropTypes.arrayOf(PropTypes.string),
  selected: PropTypes.string,
  onChange: PropTypes.func,
  errors: PropTypes.shape({}),
};

export default class Editor extends React.Component {

  static DEFAULT_CONTEXTS = [
    'mainContext', 'schemaDataContext',
    'deduplicationContext', 'relationsContext', 'exportContext',
  ]

  static propTypes = {
    readOnly: PropTypes.bool,
    valid_data: PropTypes.shape({}),
    editorAction: PropTypes.string,
    insertPenultimate: PropTypes.bool,
  }

  static contextTypes = {
    container: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context);

    this.mainContext = this.mainContext.bind(this);
    this.schemaDataContext = this.schemaDataContext.bind(this);
    this.deduplicationContext = this.deduplicationContext.bind(this);
    this.relationsContext = this.relationsContext.bind(this);
    this.exportContext = this.exportContext.bind(this);

    const { container } = context;
    const { availableContexts } = container;

    // TODO refactor
    this.state = {
      contextForm: availableContexts.length === 1 ? this[availableContexts[0]] : this.mainContext,
    };
  }

  getContainer() {
    return this.context.container;
  }

  getContextKey() {
    switch (this.state.contextForm) {
      case this.mainContext:
        return 'mainContext';
      case this.schemaDataContext:
        return 'schemaDataContext';
      case this.deduplicationContext:
        return 'deduplicationContext';
      case this.relationsContext:
        return 'relationsContext';
      case this.exportContext:
        return 'exportContext';
      default:
        console.warn('Unknown editor form context'); // eslint-disable-line no-console
        return 'main';
    }
  }

  mainContext() {
    const { onChangeMainValue, main_data, isMutable, checkValidate, store } = this.getContainer();

    const typeCursor = store.getCursor(['typeList']);
    const selected = typeCursor.get('selected');
    let types = typeCursor.get('types').deref();
    let globalTypes = typeCursor.get('global').deref();
    globalTypes = globalTypes.toJS();
    for (let i = 0; i < globalTypes.length; i++) {
      globalTypes[i].isGlobal = true;
    }
    globalTypes = Immutable.fromJS(globalTypes);
    types = types.concat(globalTypes);

    const type = types.find(t => t.get('uuid') === selected);

    const props = {
      onChangeMainValue,
      main_data,
      isMutable,
      checkValidate,
      type,
      cursor: path => store.getCursor(path),
      mainType: this.getMainTypeCursor(),
      readOnly: this.props.readOnly,
      insertPenultimate: this.props.insertPenultimate || false,
    };

    return (
      <MainDataController {...props} />
    );
  }

  schemaDataContext() {
    const container = this.getContainer();
    const { store, onDisabledChange, isMutable, checkValidate, main_data } = container;
    const props = {
      cursor: () => store.getCursor(['typeList']),
      container,
      onDisabledChange,
      isMutable,
      checkValidate,
      main_data,
    };
    return (
      <SchemaDataController {...props} />
    );
  }

  exportContext() {
   const container = this.getContainer();
    const { store, onDisabledChange, isMutable, checkValidate, main_data } = container;
    const props = {
      cursor: () => store.getCursor(['exportTemplates']),
      container,
      onDisabledChange,
      isMutable,
      checkValidate,
      main_data,
    };
    return (
      <ExportController {...props} />
    );
  }

  deduplicationContext() {
    const { store, onDisabledChange, checkValidate } = this.getContainer();
    const props = {
      onDisabledChange,
      cursor: path => store.getCursor(path),
      checkValidate,
    };
    return (
      <div>
        <DeduplicationDataController {...props} />
      </div>
    );
  }

  relationsContext() {
    const { store } = this.getContainer();
    return (
      <div>
        <RelationsDataController
          container={this.getContainer()}
          cursor={() => store.getCursor(['typeList'])}
        />
      </div>
    );
  }

  // выбор отображаемой вкладки
  chooseContext(key) {
    this.setState({ contextForm: this[key] });
  }

  getMainTypeCursor() {
    const { store } = this.getContainer();
    const types = store.getCursor(['typeList', 'types']);
    const mainTypeIndex = types.findIndex(t => t.get('main') === true);
    return store.getCursor(['typeList', 'types', mainTypeIndex, 'config']);
  }

  render() {
    const { container } = this.context;
    const { availableContexts } = container;
    const { valid_data } = this.props;
    const errors = {
      mainContext: !valid_data.main_data,
      deduplicationContext: !valid_data.deduplication_data,
    };
    return (
      <div>
        {availableContexts.length > 1 &&
          <nav className="aui-navgroup aui-navgroup-horizontal editor-navigation">
            <div className="aui-navgroup-inner">
              <div className="aui-navgroup-primary">
                <ContextItemsList
                  availableContexts={availableContexts}
                  selected={this.getContextKey()}
                  errors={errors}
                  onChange={this.chooseContext.bind(this)}
                />
              </div>
            </div>
          </nav>
        }
        <div className="container-fluid" style={{ padding: 0 }}>
          <div className={this.props.readOnly ? 'overlay-block' : ''} />
          <CSSTransitionGroup transitionLeave={false} transitionName="modal-editor-transition">
            <div key={this.getContextKey()}>
              {this.state.contextForm()}
            </div>
          </CSSTransitionGroup>
        </div>
      </div>
    );
  }

}
