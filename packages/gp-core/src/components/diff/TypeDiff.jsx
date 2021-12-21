import React from 'react';
import isDiff from './isDiff';
import Diff from './Diff';
import getTypeLabel from './typeLabels';

const TypeDiff = (props) => {
  const { data } = props;
  if (!isDiff(data)) {
    return <span> {getTypeLabel(data).title}</span>;
  }
  return <Diff lhs={getTypeLabel(data.lhs).title} rhs={getTypeLabel(data.rhs).title} />;
};

export default TypeDiff;
