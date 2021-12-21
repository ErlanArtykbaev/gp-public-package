import get from 'lodash/get';
import has from 'lodash/has';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';

export function unmergeSchema(fullSchema, parentSchema) {
  // если в основном типе есть поля, которые есть у родителя, то они удаляются
  const newSchema = cloneDeep(fullSchema);
  const schemaProperties = fullSchema.config.properties;
  const schemaTypes = fullSchema.types || [];
  const parentSchemaProperties = parentSchema.config.properties;
  const parentTypes = parentSchema.types || [];
  const finalProperties = schemaProperties.reduce((result, prop) => {
    if (!parentSchemaProperties.find(p => p.id === prop.id)) {
      console.log('Add prop ', prop.id);
      result.push(prop);
    }
    return result;
  }, []);
  console.log(finalProperties);
  const newTypes = schemaTypes.map((t) => {
    const parentType = parentTypes.find(pt => pt.id === t.id);
    return unmergeSchema(t, parentType);
  });
  newSchema.config.properties = finalProperties;
  if (fullSchema.types) {
    newSchema.types = newTypes;
  }
  console.log(newSchema.config.properties);
  return newSchema;
}

export function mergeSchema(schema = {}, parentSchema = {}) {
  const newSchema = cloneDeep(schema);
  if (!schema && parentSchema) {
    return cloneDeep(parentSchema);
  }
  const parentProperties = get(parentSchema, 'config.properties', []);
  const parentTypes = get(parentSchema, 'types', []);
  const schemaProperties = get(schema, 'config.properties', []);
  const schemaTypes = get(schema, 'types', []);
  // Идем по всем свойствам родителя
  const newProperties = parentProperties.reduce((result, parentProperty) => {
    // Ищем свойство с таким айдишником в ребенке
    const propertyIndex = schemaProperties.findIndex(p => p.id === parentProperty.id);
    if (propertyIndex === -1) {
      // Если поля нет, просто добавляем
      result.push(parentProperty);
    } else {
      // Пока предположим что поля блокировались для добавления и их нет
    }
    return result;
  }, []);
  set(newSchema, 'config.properties', [...schemaProperties, ...newProperties]);
  if (has(parentSchema, 'types')) {
    const newTypes = parentTypes.reduce((result, parentType) => {
      const typeIndex = schemaTypes.findIndex(t => t.id === parentType.id);
      if (typeIndex === -1) {
        // Если типа нет, то просто добавляем
        result.push(parentType);
      } else {
        // Если тип есть
        set(schemaTypes, typeIndex, mergeSchema(get(schemaTypes[typeIndex]), parentType));
      }
      return result;
    }, []);
    set(newSchema, 'types', [...schemaTypes, ...newTypes]);
  }
  return newSchema;
}
