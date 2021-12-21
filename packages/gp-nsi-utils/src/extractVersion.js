import get from 'lodash/get';
import last from 'lodash/last';

export default item => last(item.versions) || get(item, 'version') || item;
