import set from 'lodash/set';
import extractProperties from './extractProperties';
import isComplex from './isComplex';

function propertiesAssemlber(types, childrenPath = ['config', 'properties']) {
  function assembleProperties(schemaFragment) {
    const complexProperties = (extractProperties(schemaFragment) || []).filter(p => isComplex(p));
    const simpleProperties = (extractProperties(schemaFragment) || []).filter(p => !isComplex(p));

    return [
      ...simpleProperties,
      ...complexProperties.map((prop) => {
        const type = types.find(nsiSchemaType => nsiSchemaType.id === prop.type);
        const property = { ...prop };
        set(property, childrenPath, assembleProperties(type));
        return property;
      }),
    ];
  }
  return assembleProperties;
}

// Делает из обычной НСИ-схемы древовидную
// TODO write tests
export default function createSimpleSchema(nsiSchema) {
  const properties = propertiesAssemlber(nsiSchema.types)(nsiSchema);
  return {
    properties,
  };
}

// function propertiesAssemlber2(types, childrenPath = ['config', 'properties']) {
//   function assembleProperties(schemaFragment, path) {
//     const complexProperties = (extractProperties(schemaFragment) || []).filter(p => isComplex(p));
//     const simpleProperties = (extractProperties(schemaFragment) || []).filter(p => !isComplex(p));
//
//     return [
//       ...simpleProperties
//         .map(prop => ({ ...prop, key: path.length ? [...path, prop.id].join('.') : prop.id, displayName: prop.title })),
//       ...complexProperties.map((prop) => {
//         const type = types.find(nsiSchemaType => nsiSchemaType.id === prop.type);
//         const property = {
//           ...prop,
//           key: [...path, prop.id].join('.'),
//           displayName: prop.title,
//         };
//         set(property, childrenPath, assembleProperties(type, [...path, type.id]));
//         return property;
//       }),
//     ];
//   }
//   return assembleProperties;
// }
//
// export function createNestedSchema(nsiSchema) {
//   const properties = propertiesAssemlber2(nsiSchema.types, 'children')(nsiSchema, []);
//   return [...properties];
// }
