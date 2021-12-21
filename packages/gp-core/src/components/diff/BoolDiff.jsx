import React from 'react';
import isDiff from './isDiff';
import s from './styles.scss';

const ColoredCheckbox = props => (
  <span className={s.checkboxWrapper}>
    <div className={s.checkboxOverlay} style={{ backgroundColor: props.color }} />
    <input type="checkbox" checked={props.data} disabled />
  </span>
);

ColoredCheckbox.propTypes = {
  color: React.PropTypes.string,
  data: React.PropTypes.bool,
};

const BoolDiff = (props) => {
  const data = props.data;
  if (!isDiff(data)) {
    return <span> <input type="checkbox" checked={data} disabled /></span>;
  }
  return (
    <span>
      {' '}
      <ColoredCheckbox color="red" data={data.lhs} />
      {' '}
      <ColoredCheckbox color="green" data={data.rhs} />
    </span>
  );
};

BoolDiff.propTypes = {
  data: React.PropTypes.any,
};

export default BoolDiff;
