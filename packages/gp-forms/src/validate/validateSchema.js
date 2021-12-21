import { validateRow } from 'gp-forms/lib/validate';

export default function validate(schemaFragment, references, data = {}, object = {}) {
  const properties = schemaFragment.properties || schemaFragment.config.properties;
  if (properties) {
    properties.forEach((prop) => {
      const innerProperties = prop.properties || prop.config.properties;
      if (innerProperties) {
        object[prop.id] = {};
        validate(prop, references, data[prop.id], object[prop.id]);
      } else {
        object[prop.id] = validateRow(prop, data[prop.id], references);
      }
    });
  }
  return object;
}
