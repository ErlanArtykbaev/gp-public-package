import get from 'lodash/get';

// NOTE сделать отдельный пакет с типами
// import { EntryVersion } from 'gp-core/lib/@types/nsi';

export default version => get(version, 'dateStart', get(version, 'dateEnd'));
