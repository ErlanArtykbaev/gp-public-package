import has from 'lodash/has';
import { ItemsService } from '../services';

export const noRule = {
  key: '',
  title: '',
};

function setRules(data) {
  const rules = {};
  const object_types = {};
  const object_gruppovie_pravila = [];
  let object_version;

  function hasErrors(object) {
    const hasVersions = has(object, ['deduplication_types', 0, 'version']);
    if (hasVersions && object && object.deduplication_terms && object.deduplication_types && object.gruppovie_pravila && !object.deduplication_types.error && !object.gruppovie_pravila.error && !object.deduplication_terms.error) {
      return false;
    }
    return true;
  }

  if (hasErrors(data)) {
    this.setState({ rules, types: object_types, gruppovie_pravila: object_gruppovie_pravila });
    return false;
  }

  data.deduplication_types.forEach((type) => {
    rules[type.version.object.key] = [noRule];
    object_types[type.id] = type.version.object.key;
  });

  function format_attribute(props) {
    if (props === undefined) {
      return props;
    }

    const format_props = [];
    props.forEach((prop) => {
      format_props.push({
        imya_argumenta: prop.imya_argumenta,
        tip_argumenta: object_types[prop.tip_argumenta],
        key: prop.kod,
      });
    });
    return format_props;
  }

  data.gruppovie_pravila.forEach((pravila) => {
    object_version = pravila.version.object;
    object_gruppovie_pravila.push({
      key: object_version.key,
      title: object_version.title,
      parametri_atributov: format_attribute(object_version.parametri_atributov),
      parametri_gruppovoi_funktsii: format_attribute(object_version.parametri_gruppovoi_funktsii),
    });
  });

  data.deduplication_terms.forEach((rule) => {
    const array_attribute_parameters = [];
    const { version: { object: { types, title, key, attribute_parameters } } } = rule;
    if (attribute_parameters) {
      attribute_parameters.forEach((prop) => {
        array_attribute_parameters.push({
          imya_argumenta: prop.imya_argumenta,
          tip_argumenta: object_types[prop.tip_argumenta],
          key: prop.kod,
        });
      });
    }

    if (types) {
      types.forEach((type) => {
        const primitiveType = data.deduplication_types.find(prop => prop.id === type.type).version.object.key;
        rules[primitiveType].push({ title, key, array_attribute_parameters });
      });
    }
  });

  const result = {
    rules,
    types: object_types,
    gruppovie_pravila: object_gruppovie_pravila,
  };
  return result;
  // console.log(JSON.stringify({ rules, types: object_types, gruppovie_pravila: object_gruppovie_pravila }));
  // this.setState({ rules, types: object_types, gruppovie_pravila: object_gruppovie_pravila });
}

async function getDeduplicationRules() {
  const data = await Promise
    .all([
      ItemsService.path('nsi/tech/deduplication_terms').get(),
      ItemsService.path('nsi/tech/deduplication_types').get(),
      ItemsService.path('nsi/tech/gruppovie_pravila').get(),
    ])
    .then(([deduplication_terms, deduplication_types, gruppovie_pravila]) => ({
      deduplication_terms: deduplication_terms.items,
      deduplication_types: deduplication_types.items,
      gruppovie_pravila: gruppovie_pravila.items,
    }));
  return setRules(data);
}

export default getDeduplicationRules;
// getDeduplicationRules().then(r => console.log(r));
