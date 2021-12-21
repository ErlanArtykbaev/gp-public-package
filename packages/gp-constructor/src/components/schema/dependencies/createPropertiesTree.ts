import { ElementService } from '@gostgroup/gp-api-services/lib/services';
import { Schema, SchemaProperty, Element } from '@gostgroup/gp-types/lib/nsi';
import flattenDeep from 'lodash/flattenDeep';
import has from 'lodash/has';
import { TYPE_NAMES, typesMap } from '../../../types';

const MAX_DEPTH = 4;

export interface DependencyProperty {
  value: string;
  label: string;
  reference: string;
  parentId: string;
  rootReference: string;
  data: SchemaProperty;
}

function getType(typeId) {
  return TYPE_NAMES[typeId] || typeId;
}

const createPropertiesTree = async (schema: Schema, childProperty) => {
  const types = schema.types;
  const typeIds = types.map(t => t.id);
  const mainTypeProperties = schema.config.properties;

  // TODO доработать вложенность
  async function combineReference(parent: SchemaProperty, depth: number): Promise<DependencyProperty[]> {
    if (depth > MAX_DEPTH) return [];
    const key = parent.config.key;
    const title = parent.title;
    const id = parent.id;
    const parentElement = (await ElementService.path(key).get() as Element);
    const parentTypes = parentElement.schema.types;
    const parentTypeIds = parentTypes.map(t => t.id);
    const properties = await Promise.all(parentElement.schema.config.properties.map(async (child) => {
      const childTitle = child.title;
      const childId = child.id;
      if (child.type === 'reference') {
        return await combineReference(child, depth + 1);
      }
      if (parentTypeIds.includes(child.type)) {
        const innerComplexProperties = await createPropertiesTree(parentElement.schema, child);
        return flattenDeep(innerComplexProperties).map(p => ({
          ...p,
          label: `${title}.${p.label}`,
          value: `${id}.${p.value}`,
          parentId: id,
        }));
      }
      return [{ label: `${title}.${childTitle} [${getType(child.type)}]`, value: `${id}.${childId}`, data: child, reference: key, parentId: id }];
    }));

    const parentProperty = [{ label: `${title} [${getType(parent.type)}]`, value: id, data: parent, rootReference: key }];
    return [
      parentProperty,
      ...flattenDeep(properties),
    ];
  }

  async function createComplexReferences(complexField: SchemaProperty): Promise<DependencyProperty[]> {
    const type = types.find(t => t.id === complexField.type);

    const properties = await Promise.all(type.config.properties.map(async (p) => {
      if (has(typesMap[p.type], 'innerProperties')) {
        return createInnerProperties(p, typesMap[p.type].innerProperties);
      }
      if (p.type === 'reference') {
        return await combineReference(p, 1);
      }
      if (typeIds.includes(p.type)) {
        return await createComplexReferences(p);
      }
      return [{ label: `${p.title} [${getType(p.type)}]`, value: p.id, data: p }];
    }));

    const complexProperty = [{ label: `${complexField.title} [${getType(complexField.type)}]`, value: complexField.id, data: complexField }];

    const result = [
      complexProperty,
      ...flattenDeep(properties).map(p => ({
        ...p,
        label: `${complexField.title}.${p.label}`,
        value: `${complexField.id}.${p.value}`,
      })),
    ];

    return result;
  }

  function createInnerProperties(p, innerProperties) {
    const mappedInnerProperties = innerProperties.map(b => ({ value: `${p.id}.${b.value}`, label: `${p.title}.${b.label}` }));
    const result = [
      { label: `${p.title} [${getType(p.type)}]`, value: p.id },
      ...mappedInnerProperties,
    ];

    return result;
  }

  if (childProperty) {
    return await createComplexReferences(childProperty);
  }

  let properties = await Promise.all(mainTypeProperties.map(async (p) => {
    if (has(typesMap[p.type], 'innerProperties')) {
      return createInnerProperties(p, typesMap[p.type].innerProperties);
    }
    if (p.type === 'reference') {
      return await combineReference(p, 1);
    }
    if (typeIds.includes(p.type)) {
      return await createComplexReferences(p);
    }
    return [{ label: `${p.title} [${getType(p.type)}]`, value: p.id, data: p }];
  })) as DependencyProperty[][];

  properties = flattenDeep(properties);

  console.log(properties);

  return properties;
};

export default createPropertiesTree;
