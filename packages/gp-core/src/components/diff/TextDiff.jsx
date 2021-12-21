import React from 'react';
import isDiff from './isDiff';
import Diff from './Diff';

const TextDiff = (props) => {
  const data = props.data;
  if (!isDiff(data)) {
    return <span> {`${data}`}</span>;
  }
  return <Diff lhs={data.lhs} rhs={data.rhs} />;
};

export default TextDiff;
