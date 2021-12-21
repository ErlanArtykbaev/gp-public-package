import React from 'react';
import getMap from './map.js';

export default EnhansibleComponent => props => <EnhansibleComponent {...props} map={getMap()} />;
