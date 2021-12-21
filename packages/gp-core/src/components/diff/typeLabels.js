import { typesMap } from '@gostgroup/gp-constructor/lib/types';

export default type => typesMap[type] || typesMap.complex;
