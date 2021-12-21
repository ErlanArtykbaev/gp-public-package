import React from 'react';
import { LabeledDiff, TextDiff } from 'gp-core/lib/components/diff';
import diffElements from '../helpers';
import TypeDiff from './TypeDiff';
import Panel from './Panel';

const ElementDiff = ({ curr, next }) => {
  const diff = diffElements(next, curr);
  return (
    <Panel title={<TextDiff data={diff.shortTitle} />} change="CHANGE" >
      <LabeledDiff label="Ключ" data={diff.key} type="string" />
      <LabeledDiff label="Полное наименование" data={diff.fullTitle} type="string" />
      <LabeledDiff label="Краткое наименование" data={diff.shortTitle} type="string" />
      { diff.description &&
        <LabeledDiff label="Описание" data={diff.description} type="string" />
      }

      <div>
        <h4>Схема</h4>
        <TypeDiff isMain type={diff.schema} mainData={diff} />
      </div>

      <div>
        <h4>Типы</h4>
        {diff.schema.types.map(type => <TypeDiff key={type.id} type={type} mainData={diff} />)}
      </div>
    </Panel>
  );
};

ElementDiff.propTypes = {
  curr: React.PropTypes.object,
  next: React.PropTypes.object,
};

export default ElementDiff;
