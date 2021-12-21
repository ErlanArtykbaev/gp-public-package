import merge from 'lodash/merge';
import {
  MultiRecursiveItemService,
  ElementService,
  ItemsService,
  RecursiveSchemaService,
} from '../../services';

const hasEmbeddedProps = schema => (
  schema.config.properties.some(p => p.type === 'reference' && p.config.isEmbedded)
);

const emptyVersions = () => ({ items: [] });

const extractSubrefs = (props = [], ownDepth = 1) => (
  props.reduce((res, p) => {
    if (!p._schema) return res;

    res.refs[p.config.key] = p._schema;
    const { refs, depth } = extractSubrefs(p._schema.config.properties, ownDepth + 1);
    return {
      refs: { ...res.refs, ...refs },
      depth: Math.max(res.depth, depth),
    };
  }, { refs: {}, depth: ownDepth })
);

async function embedRefs(element) {
  if (element.element.schema.depth <= 1) {
    return element;
  }

  const ids = element.versions.items.map(i => i.id).join(',');
  (await MultiRecursiveItemService
    .path(element.element.absolutPath)
    .get({ ids, depth: element.element.schema.depth + 1 })
  ).forEach((item) => {
    // const item = JSON.parse(str);
    // item.version.object = JSON.parse(item.version.object);
    merge(element.versions.items.find(i => i.id === item.id), item);
  });

  return element;
}

function fetchDeepSchema(element) {
  if (!hasEmbeddedProps(element.schema)) return { refs: {}, depth: 1 };
  return RecursiveSchemaService.path(element.absolutPath).get()
    .then(schema => extractSubrefs(schema.config.properties));
}

export default async (fullPath, params = {}, withItems = true) => {
  const initialElement = await Promise
    .all([
      ElementService.path(fullPath).get(),
      withItems ? ItemsService.path(fullPath).get(params) : emptyVersions(),
    ])
    .then(([element, versions]) => Promise.all([element, versions, fetchDeepSchema(element)]))
    .then(([element, versions, { refs, depth }]) => {
      element.schema.refs = refs;
      element.schema.depth = depth;
      const date = params.date;
      return { element, versions, date };
    });

  return embedRefs(initialElement);
};
