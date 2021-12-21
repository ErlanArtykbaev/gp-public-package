export { flattenSchema, RECORD_TABLE_AVAILABLE_TYPES } from '@gostgroup/gp-utils/lib/flattenSchema';

export function evalResult(data, condition, key) {
  data = data.toString();
  switch (condition) {
    case 'equals': return (data === key.toString());
    case 'like': return (data.indexOf(key) >= 0);
    case 'gt': return (data > key);
    case 'lt': return (data < key);
    default: return false;
  }
}
