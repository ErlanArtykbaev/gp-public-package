import React, { PropTypes } from 'react';
import PropertyDiff from './PropertyDiff';
import Panel from './Panel';

const PropertyListDiff = ({ properties }) => (
  <Panel title="Свойства" change={properties.some(p => p.diff) ? 'CHANGE' : null}>
    {properties.map(p => <PropertyDiff key={p.id} property={p} />)}
  </Panel>
);

PropertyListDiff.propTypes = {
  properties: PropTypes.array.isRequired,
};

export default PropertyListDiff;
