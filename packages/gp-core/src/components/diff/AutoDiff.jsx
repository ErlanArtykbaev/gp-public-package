import React from 'react';
import TextDiff from './TextDiff';
import TypeDiff from './TypeDiff';
import BoolDiff from './BoolDiff';

const diffTypes = {
  string: TextDiff,
  bool: BoolDiff,
  type: TypeDiff,
};
const DEF_CMP = TextDiff;

const AutoDiff = (props) => {
  const { data, type } = props;
  let DiffCmp = diffTypes[type];
  if (!DiffCmp) {
    console.warn('invalid diff type', type);
    DiffCmp = DEF_CMP;
  }
  return <DiffCmp {...props} />;
};

AutoDiff.propTypes = {
  type: React.PropTypes.string,
  data: React.PropTypes.any,
};

export default AutoDiff;
