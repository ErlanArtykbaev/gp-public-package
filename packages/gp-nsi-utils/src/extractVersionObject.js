import get from 'lodash/get';
import last from 'lodash/last';

export default item => get(last(get(item, 'versions')), 'object') || get(item, 'version.object') || get(item, 'version') || item;
