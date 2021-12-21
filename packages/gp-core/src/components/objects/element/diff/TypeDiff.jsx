import React from 'react';
import { LabeledDiff, TextDiff, isDiff } from 'gp-core/lib/components/diff';
import PropertyList from './PropertyListDiff';
import Panel from './Panel';

const TypeDiff = ({ type, mainData, isMain }) => {
  const typeVersion = isDiff(type) ? (type.lhs || type.rhs) : type;
  const id = typeVersion.id;
  const name = typeVersion.title;
  const properties = typeVersion.config.properties;
  const isLocal = typeVersion.isGlobal !== true;
  const nameType = (isMain && isLocal) ? mainData.shortTitle : name;
  const typeId = (isMain && isLocal) ? mainData.key : id;
  const { isInlineEditable } = typeVersion;
  const change = type.diff;

  return (
    <Panel title={<TextDiff data={nameType} />} change={change}>
      <LabeledDiff label="Идентификатор типа" data={typeId} type="string" />
      <LabeledDiff label="Имя типа" data={nameType} type="string" />
      <LabeledDiff label="Форма ввода" data={isInlineEditable} type="bool" />

      <PropertyList nameType={nameType} properties={properties} />
    </Panel>
  );
};

TypeDiff.propTypes = {
  type: React.PropTypes.object.isRequired,
  mainData: React.PropTypes.object.isRequired,
  isMain: React.PropTypes.bool,
};

export default TypeDiff;
