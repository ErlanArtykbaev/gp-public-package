import React from 'react';
import DIFF_COLORS from './DIFF_COLORS';

const Diff = ({ lhs, rhs }) => (
  <span>
    {' '}
    <span style={{ color: DIFF_COLORS.TEXT.REMOVE, textDecoration: 'line-through' }}>
      {`${lhs}`}
    </span>
    {' '}
    <span style={{ color: DIFF_COLORS.TEXT.ADD }}>
      {`${rhs}`}
    </span>
  </span>
);

export default Diff;
