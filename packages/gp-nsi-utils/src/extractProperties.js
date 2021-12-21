import get from 'lodash/get';

export default schemaFragment => get(schemaFragment, 'properties') || get(schemaFragment, 'config.properties');
