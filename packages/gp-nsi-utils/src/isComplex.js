import { SIMPLE_TYPE_NAMES } from '@gostgroup/gp-data-types/lib/constants/nsiTypes';

export default function isComplex(property = {}) {
  return !SIMPLE_TYPE_NAMES.includes(property.type);
}
