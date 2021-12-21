import get from 'lodash/get';
import find from 'lodash/find';
import last from 'lodash/last';
import assign from 'lodash/assign';
import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';

export const RECORD_TABLE_AVAILABLE_TYPES = [
  'auto',
  'string',
  'number',
  'integer',
  'date',
  'bool',
  // 'complex',
  'table',
  'computable',
  'file',
  'uuid',
  'reference',
  'classifier',
];

const makeRefPath = (path) => {
  const refPath = path.slice();
  refPath.splice(path.length - 1, 1, `_${path[path.length - 1]}`);
  return refPath;
};

/*
  Принимает схему, разворачивает:
    - Составные типы
    - Вложенные ссылочные типы (если есть schema.refs со схемами справочников по ключу)
  Выплевывает массив из атомарных свойств.
  В каждое свойство добавляем:
    - уникальный id в рамках схемы
    - deepPath, по которому можно вытащить данные поля из записи (с _ для вложенных)
    - parents - массив родительских полей
    - еще всякое дерьмо
  Пример:

  flattenSchema({
    config: {
      properties: [
        { type: 'number', id: 'own' },
        { type: 'complex_type', id: 'comp' },
        { type: 'reference', config: { key: 'nsi/foreign', isEmbedded: true }, id: 'ref' },
      ],
      types: {
        'complex_type': {
          config: {
            properties: [
              { type: 'number', title: 'own' },
              { type: 'number', title: 'nest2' },
            ]
          },
          ...
        }
      },
      refs: {
        'nsi/foreign': {
          element: {
            schema: { ... }
          }
        }
      }
    }
  })
  -->
  [
    { type: 'number', id: 'own', deepPath: ['own'] },
    { type: 'number', id: 'comp.nest1', deepPath: ['comp', 'nest1'] },
    { type: 'number', id: 'comp.nest2', deepPath: ['comp', 'nest2'] },
    { type: 'string', id: 'ref.some_field', ['_ref', 'some_field'] },
  ]
*/
export const flattenSchema = (schema, types, refs, parents = []) => {
  types = types || schema.types;
  refs = refs || schema.refs || {};

  const isPropSafeEmbeddable = prop => (
    prop.type === 'reference' &&
    prop.config.isEmbedded &&
    refs[prop.config.key] && // ссылочный тип подтянут
    !parents.some(p => p.config.key === prop.config.key) // не зацикливаться
  );

  const unwrappedProps = schema.config.properties.map((prop) => {
    const deepPath = get(last(parents), 'deepPath', []).concat(prop.id);
    const node = { ...prop, deepPath, parents, depth: deepPath.length };
    const nodeChain = parents.concat(node);

    if (isPropSafeEmbeddable(prop)) {
      const refSchema = refs[prop.config.key];
      const refPath = makeRefPath(deepPath);

      const { embedIds } = prop.config;
      const embedProps = refSchema.config.properties
        .filter(p => isEmpty(embedIds) || embedIds.includes(p.id));

      node.deepPath = refPath;
      const embeddedSchema = assign(
        {},
        refSchema,
        { config: { properties: embedProps } }
      );
      const leaves = flattenSchema(embeddedSchema, embeddedSchema.types, refs, nodeChain)
        .map(leaf => ({ ...leaf, isRef: true }));

      // чтобы заголовок вложенной записи был ссылкой на саму запись
      const refTitle = find(leaves, refItem => (
        refItem.depth === node.depth + 1 && last(refItem.deepPath) === 'title' // поле title с первого уровня
      ));
      assign(refTitle, {
        isRefTitle: true,
        type: 'reference', // отображать заголовок как ссылку
        id: prop.id,
        config: prop.config, // для фильтрации столбцов
        refPath, // брать title из вложенной записи
        deepPath, // id лежит только в ссылающемся типе
      });

      return leaves;
    }

    // атомарный тип
    if (RECORD_TABLE_AVAILABLE_TYPES.includes(prop.type)) {
      return [{
        ...node,
        refPath: prop.type === 'reference' ? makeRefPath(deepPath) : null,
      }];
    }

    // попали сюда - составной тип
    const nested = find(types, type => type.id === prop.type);
    // Если схема составного типа не найдена - ничего не возвращаем
    return nested ? flattenSchema(nested, types, refs, nodeChain) : [];
  });

  return flatten(unwrappedProps).map((leaf) => {
    leaf.id = leaf.deepPath.join('.');
    leaf.leaves = [leaf];
    leaf.isLeaf = true;
    leaf.parents.forEach((p) => {
      p.isLeaf = false;
      if (!p.leaves || !p.leaves.some(l => l.id === leaf.id)) {
        p.leaves = (p.leaves || []).concat(leaf);
      }
    });
    return leaf;
  });
};
