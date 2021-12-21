import React from 'react';
import AutoDiff from './AutoDiff';

const LabeledDiff = props => (
  <div {...props}>
    <label className="control-label">{props.label}</label>
    <AutoDiff {...props} />
  </div>
);

LabeledDiff.propTypes = {
  label: React.PropTypes.string,
};

export default LabeledDiff;
