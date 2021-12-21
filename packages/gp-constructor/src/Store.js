import Immutable from 'immutable';
import Cursor from 'immutable/contrib/cursor';
import keyBy from 'lodash/keyBy';
import some from 'lodash/some';
import uniq from 'lodash/uniq';
import { createNewType } from './models/type.js';
import { createNewDependency } from './models/dependency.js';
import { createNewSchema } from './models/schema.js';
import { createNewProperty, getTitleProp } from './models/property.js';
import { typesMap } from './types.js';
import { createNewType as createNewExport } from './models/export.js';

// NOTE включайте по надобности, а то было true и аналитики все ломали
const CAN_EDIT_EXISTING_SCHEMA = false;

const EMPTY_SCHEMA = {
  typeList: {
    selected: null,
    types: [],
    dependencies: [],
  },
};

/**
 * Делает из обычной схемы immutable со специфичной структурой
 */
const normalizeSchema = (schema, isDeletable = false, isMutable = false) => {
  const emptyList = new Immutable.List();
  let types = new Immutable.List();
  let dependencies = new Immutable.List();
  const uuidsByKey = {};

  function convertType(schema) {
    let type = createNewType(types);

    uuidsByKey[schema.id] = type.get('uuid');

    type = type.setIn(['id', 'value'], schema.id);
    type = type.setIn(['title', 'value'], schema.title);
    type = type.set('idTouched', true);
    type = type.set('isDeletable', isDeletable);
    type = type.set('isMutable', isMutable);

    const properties = new Immutable.List(schema.config.properties);

    type = type.set('properties', properties);
    type = type.set('config', Immutable.fromJS(schema.config));

    return type;
  }

  function convertDependency(schema) {
    let dependency = createNewDependency(dependencies);
    uuidsByKey[schema.id] = dependency.get('uuid');
    dependency = dependency.setIn(['title', 'value'], schema.title.value);
    dependency = dependency.set('idTouched', true);
    dependency = dependency.set('isDeletable', isDeletable);
    dependency = dependency.set('isMutable', isMutable);
    dependency = dependency.set('isInlineEditable', schema.isInlineEditable);
    dependency = dependency.set('type', schema.type);
    dependency = dependency.set('rules', Immutable.fromJS(schema.rules));
    return dependency;
  }

  function getUUIDByTypeKey(typeKey) {
    const uuid = uuidsByKey[typeKey];

    if (!uuid) {
      throw new Error(`Type '${typeKey}' not found`);
    }
    return uuid;
  }

  const multiConverter = type => (prop, property) => {
    const typeKey = type === 'complex' ? property.type : property.config.type;
    const uuid = uuidsByKey[typeKey];

    if (!uuid) {
      throw new Error(`Type '${typeKey}' not found`);
    }

    return prop.set('type', type)
      .setIn(['typeConfig', 'type'], uuid);
  };

  const converters = {
    complex: multiConverter('complex'),
    list: multiConverter('list'),
    table: multiConverter('table'),
  };

  function convertProperty(property) {
    let type = property.type;

    if (!typesMap[type]) {
      type = 'complex';
    }

    const prop = createNewProperty(emptyList)
      .setIn(['id', 'value'], property.id)
      .setIn(['title', 'value'], property.title)
      .set('idTouched', true)
      .set('required', property.required)
      .set('unique', property.unique)
      .set('useStyles', property.useStyles)
      .set('editableByAdminOnly', property.editableByAdminOnly)
      .set('type', property.type)
      .set('original', Immutable.fromJS(property))
      .set('typeConfig', Immutable.fromJS(property.config))
      .set('isDeletable', isDeletable)
      .set('isMutable', isMutable)
      .set('isRequireChangable', property.required && property.id !== 'title')
      .set('isUniqueChangeable', property.unique);

    const converter = converters[type];

    return converter ? converter(prop, property) : prop;
  }

  const mainType = convertType(schema);
  types = types.push(mainType);
  types = types.concat(new Immutable.List(schema.types).map(convertType));
  types = types.map(type => type.set('properties', type.get('properties').map(convertProperty)));
  dependencies = dependencies.concat(new Immutable.List(schema.dependencies).map(convertDependency));
  return { mainType, types, dependencies };
};

const normalizeExportTemplates = (schema) => {
  let exportTemplates = new Immutable.List();
  const uuidsByKey = {};

  function convertExportTemplate(schema) {
    let exportTemplate = createNewExport(exportTemplates);
    uuidsByKey[schema.id] = exportTemplate.get('uuid');
    exportTemplate = exportTemplate.setIn(['title', 'value'], schema.title.value);
    exportTemplate = exportTemplate.set('isDeletable', true);
    exportTemplate = exportTemplate.set('isMutable', true);
    exportTemplate = exportTemplate.set('format', schema.format);
    exportTemplate = exportTemplate.set('template', schema.template);
    return exportTemplate;
  }
  exportTemplates = exportTemplates.concat(new Immutable.List(schema).map(convertExportTemplate));
  return { exportTemplates };
};

export default class Store {

  constructor(callback) {
    this.onChange = callback || this.onChange;

    this._data = Immutable.fromJS(EMPTY_SCHEMA);
  }

  onChange() {
    throw new Error('Change listener is not attached');
  }

  getCursor(path) {
    return Cursor.from(this._data, path, (newData) => {
      this._data = newData;
      this.onChange();
    });
  }

  getSelectedType() {
    const typeList = this.getCursor(['typeList']);
    const globalTypes = typeList.get('global');
    const types = typeList.get('types');
    const dependencies = typeList.get('dependencies');
    const selected = typeList.get('selected');
    return globalTypes.find(t => t.get('uuid') === selected) ||
      types.find(t => t.get('uuid') === selected) ||
      dependencies.find(t => t.get('uuid') === selected);
  }

  getData() {
    return this._data;
  }

  getTypeWithImportedProperties(type, properties, cursor) {
    const emptyList = new Immutable.List();
    const uuidsByKey = {};

    cursor.get('types').toJS().forEach((t) => {
      uuidsByKey[t.id.value] = t.uuid;
    });

    const multiConverter = type => (prop, property) => {
      const typeKey = type === 'complex' ? property.type : property.config.type;
      const uuid = uuidsByKey[typeKey];

      if (!uuid) {
        throw new Error(`Type '${typeKey}' not found`);
      }

      return prop.set('type', type)
        .set('typeConfig', new Immutable.Map({ type: uuid }));
    };

    const converters = {
      complex: multiConverter('complex'),
      list: multiConverter('list'),
      table: multiConverter('table'),
    };

    function convertProperty(property) {
      let type = property.type;

      if (!typesMap[type]) {
        type = 'complex';
      }

      const converter = converters[type];
      let prop = createNewProperty(emptyList);

      prop = prop.setIn(['id', 'value'], property.id);
      prop = prop.setIn(['title', 'value'], property.title);
      prop = prop.set('idTouched', true);
      prop = prop.set('required', property.required);
      prop = prop.set('unique', property.unique);
      prop = prop.set('useStyles', property.useStyles);
      prop = prop.set('editableByAdminOnly', property.editableByAdminOnly);
      prop = prop.set('type', property.type);
      prop = prop.set('typeConfig', Immutable.fromJS(property.config));
      prop = prop.set('isMutable', false);
      prop = prop.set('isRequireChangable', property.required && property.id !== 'title');
      prop = prop.set('isUniqueChangeable', property.unique);

      if (converter) {
        prop = converter(prop, property);
      }

      return prop;
    }

    type = type.set('properties', new Immutable.List(properties));
    type = type.set('properties', type.get('properties').map(convertProperty));

    return type;
  }

  getSchema(_data) {
    const data = _data || this._data;
    const types = data.getIn(['typeList', 'types']).toJS();
    const dependencies = data.getIn(['typeList', 'dependencies']).toJS();
    const globalTypes = data.getIn(['typeList', 'global']).toJS();
    const main = types.filter(t => t.main)[0];
    const restTypes = types.filter(t => !t.main);
    const typesByUUID = keyBy(types, 'uuid');
    const globalTypesByUUID = keyBy(globalTypes, 'uuid');
    const restTypesLocal = [];
    let restTypesLength = 0;

    if (!main) {
      throw new Error('No main type');
    }

    function getTypeByUUID(uuid) {
      let type = typesByUUID[uuid];

      if (!type) {
        type = globalTypesByUUID[uuid];

        if (!type) {
          throw new Error(`Referenced unknown type: ${type}`);
        }

        typesByUUID[uuid] = type;
        restTypes.push(type);
      }

      return type;
    }

    function complexConverter(property) {
      const uuid = property.typeConfig.type;
      let type = typesByUUID[uuid];

      if (!type) {
        type = globalTypesByUUID[uuid];

        if (!type) {
          throw new Error('Referenced unknown type');
        }

        typesByUUID[uuid] = type;
        restTypes.push(type);
      }

      return {
        type: type.id.value,
        config: {
          ...property.typeConfig,
        },
      };
    }

    function listConverter(property) {
      const uuid = property.typeConfig.type;
      let type = typesByUUID[uuid];

      if (!type) {
        type = globalTypesByUUID[uuid];

        if (!type) {
          throw new Error('Referenced unknown type');
        }

        typesByUUID[uuid] = type;
        restTypes.push(type);
      }

      return {
        type: 'list',
        config: {
          ...property.typeConfig,
          type: type.id.value,
        },
      };
    }

    function referenceConverter(property) {
      let key = property.typeConfig.key;

      if (key === '$current' || !key) {
        key = main.id.value;
      }

      return {
        type: 'reference',
        config: {
          ...property.typeConfig,
          key,
        },
      };
    }

    function tableConverter(property) {
      const uuid = property.typeConfig.type;
      let type = typesByUUID[uuid];

      if (!type) {
        type = globalTypesByUUID[uuid];

        if (!type) {
          throw new Error('Referenced unknown type');
        }

        typesByUUID[uuid] = type;
        restTypes.push(type);
      }

      return {
        type: 'table',
        config: {
          ...property.typeConfig,
          type: type.id.value,
        },
      };
    }

    const converters = {
      complex: complexConverter,
      list: listConverter,
      reference: referenceConverter,
      table: tableConverter,
    };

    function convertProperty(property) {
      const converter = converters[property.type];

      let result;

      if (!converter) {
        result = {
          type: property.type,
          config: property.typeConfig || {},
        };
      } else {
        result = converter(property);
      }

      result.id = property.id instanceof Object ? property.id.value : property.id;
      result.title = property.title instanceof Object ? property.title.value : property.title;
      result.required = property.required;
      result.unique = property.unique;
      result.useStyles = property.useStyles;
      result.editableByAdminOnly = property.editableByAdminOnly;

      return result;
    }

    function convertObject(type) {
      return {
        id: type.id.value,
        title: type.title.value,
        extends: 'object',
        config: {
          ...type.config,
          properties: type.properties.map(convertProperty),
        },
      };
    }

    function convertObjectTypes(type) {
      if (restTypesLocal.indexOf(type.uuid) === -1) {
        restTypesLocal.push(type.uuid);
        result.types.push(convertObject(type));
      }
    }

    const result = convertObject(main);
    result.types = [];
    result.dependencies = dependencies;
    while (restTypesLength !== restTypes.length) {
      restTypesLength = restTypes.length;
      restTypes.forEach(convertObjectTypes);
    }
    result.validationRules = data.get('validationRules').toJSON();
    result.deduplicationRules = data.get('deduplicationRules').toJSON();
    result.exportTemplates = data.get('exportTemplates').toJSON();

    return result;
  }

  /**
   * Устанавливает схему в this._data
   */
  setSchema(schema) {
    const isDeletable = CAN_EDIT_EXISTING_SCHEMA || window.useEditorBackdoor;
    const isMutable = CAN_EDIT_EXISTING_SCHEMA || window.useEditorBackdoor;
    const { mainType, types, dependencies } = normalizeSchema(schema, isDeletable, isMutable);
    const { exportTemplates } = normalizeExportTemplates(schema.exportTemplates);

    this._data = this._data.setIn(['typeList', 'types'], types)
      .setIn(['typeList', 'selected'], mainType.get('uuid'))
      .setIn(['typeList', 'dependencies'], dependencies)
      .set('validationRules', new Immutable.List(schema.validationRules || []))
      .set('deduplicationRules', Cursor.from(Immutable.fromJS(schema.deduplicationRules || {})))
      .set('exportTemplates', exportTemplates || new Immutable.List([]));
  }

  getClearSchema(clear) {
    return createNewSchema(clear);
  }

  setClearSchema(clear) {
    this._data = this.getClearSchema(clear);
  }

  setGlobalTypes(types) {
    let typeList = new Immutable.List();
    types.forEach((t) => {
      const type = normalizeSchema(t.schema).types.get(0);
      typeList = typeList.push(type);
    });
    this._data = this._data.setIn(['typeList', 'global'], typeList);
  }

  setClearGlobalTypes() {
    const types = new Immutable.List();
    let type = createNewType(types);
    let props = new Immutable.List();
    props = props.push(getTitleProp());

    type = type.set('properties', props);

    this._data = this._data.setIn(['typeList', 'global'], new Immutable.List([type]));
  }

  getGlobalSchema() {
    const data = this._data;
    const types = data.getIn(['typeList', 'global']).toJS();
    const dependencies = data.getIn(['typeList', 'dependencies']).toJS();
    const main = types.filter(t => t.main)[0];
    const restTypes = types.filter(t => !t.main);
    const typesByUUID = keyBy(types, 'uuid');
    const restTypesLocal = [];
    let restTypesLength = 0;

    if (!main) {
      throw new Error('No main type');
    }

    function complexConverter(property) {
      const uuid = property.typeConfig.type;
      const type = typesByUUID[uuid];

      if (!type) {
        throw new Error('Referenced unknown type');
      }

      return {
        type: type.id.value,
        config: {},
      };
    }

    function listConverter(property) {
      const uuid = property.typeConfig.type;
      const type = typesByUUID[uuid];

      if (!type) {
        throw new Error('Referenced unknown type');
      }

      return {
        type: 'list',
        config: {
          type: type.id.value,
        },
      };
    }

    function referenceConverter(property) {
      let key = property.typeConfig.key;

      if (key === '$current' || !key) {
        key = main.id.value;
      }

      return {
        type: 'reference',
        config: {
          key,
        },
      };
    }

    const converters = {
      complex: complexConverter,
      list: listConverter,
      table: listConverter,
      reference: referenceConverter,
    };

    function convertProperty(property) {
      const converter = converters[property.type];

      let result;

      if (!converter) {
        result = {
          type: property.type,
          config: property.typeConfig || {},
        };
      } else {
        result = converter(property);
      }

      result.id = property.id.value;
      result.title = property.title.value;
      result.required = property.required;

      return result;
    }

    function convertObject(type) {
      return {
        id: type.id.value,
        title: type.title.value,
        extends: 'object',
        config: {
          properties: type.properties.map(convertProperty),
        },
      };
    }

    function convertObjectTypes(type) {
      if (restTypesLocal.indexOf(type.uuid) === -1) {
        restTypesLocal.push(type.uuid);
        result.types.push(convertObject(type));
      }
    }

    const result = convertObject(main);
    result.types = [];
    result.dependencies = dependencies;
    while (restTypesLength !== restTypes.length) {
      restTypesLength = restTypes.length;
      restTypes.forEach(convertObjectTypes);
    }

    return result;
  }

}
