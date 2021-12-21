import React, { PropTypes } from 'react';
import { PRIMITIVE_TYPES } from '@gostgroup/gp-constructor/lib/types.js';
import { LabeledDiff, AutoDiff } from 'gp-core/lib/components/diff/';
import Panel from './Panel';

const PropertyDiff = ({ property }) => {
  const id = property.id;
  const name = property.title;
  const type = property.type;
  const isRequired = property.required;
  const isUnique = property.unique;
  // TODO useStyles свойство нужно перенести в typeEditor, потому что его использует только geojson
  const useStyles = property.useStyles;
  const isPrimitive = PRIMITIVE_TYPES.includes(type);

  return (
    <Panel title={<AutoDiff data={name} type="string" />} change={property.diff}>
      <LabeledDiff label="Идентификатор свойства" type="string" data={id} />
      <LabeledDiff label="Имя свойства" type="string" data={name} />

      {(type !== 'uuid' && type !== 'bool') &&
        // TODO: depends on _both_ type and itself
        <LabeledDiff label="Обязательное" type="bool" data={type === 'uuid' ? false : isRequired} />
      }

      {isPrimitive &&
        <LabeledDiff label="Уникальное" type="bool" data={isUnique} />
      }

      {type === 'geojson' &&
        <LabeledDiff label="Использовать стили" type="bool" data={useStyles} />
      }

      <LabeledDiff data={type} label="Тип" type="type" />

      {/* <PropertyTypeEditor
        type={type}
        nameType={this.props.nameType}
        properties={this.props.properties}
        property={property}
        value={typeConfig}
        disabled
      /> */}
    </Panel>
  );
};

PropertyDiff.propTypes = {
  property: PropTypes.object,
};

export default PropertyDiff;
